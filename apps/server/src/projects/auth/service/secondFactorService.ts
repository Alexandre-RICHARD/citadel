import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import type { Transaction } from "sequelize";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { authSettings } from "../../../configuration/authSettings.ts";
import { RejectedRequestError } from "../../../error/RejectedRequestError.ts";
import { TooManyRequestsError } from "../../../error/TooManyRequestsError.ts";
import type { BrowserContextBean } from "../bean/browserContextBean.type.ts";
import type { FlowBean } from "../bean/flowBean.type.ts";
import type { FlowOutcomeBean } from "../bean/flowOutcomeBean.type.ts";
import type { VerifiedFlowBean } from "../bean/verifiedFlowBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { flowExpiredError } from "../helper/flow/flowExpiredError.ts";
import { authLimiter } from "../limit/authLimiter.ts";
import type { Flow } from "../models/Flow.ts";
import { findConfirmedFactorsQuery } from "../query/factor/findConfirmedFactorsQuery.ts";
import { recordEmailFactorUseQuery } from "../query/factor/recordEmailFactorUseQuery.ts";
import { recordTotpUseQuery } from "../query/factor/recordTotpUseQuery.ts";
import { claimFlowMailStepQuery } from "../query/flow/claimFlowMailStepQuery.ts";
import { claimFlowQuery } from "../query/flow/claimFlowQuery.ts";
import { authEventService } from "./authEventService.ts";
import { flowService } from "./flowService.ts";
import { loginService } from "./loginService.ts";
import { recoveryCodeService } from "./recoveryCodeService.ts";
import { totpService } from "./totpService.ts";

type SecondFactorAnswer = {
	method: SecondFactorMethodEnum;
	// Tel que son schéma le nettoie : chiffres seuls, ou code de secours en majuscules sans tiret
	code: string;
};

// Ce qui a été vérifié, à consommer une seule fois dans la transaction qui fait avancer le parcours
type SecondFactorProof =
	| {
			method: SecondFactorMethodEnum.TOTP;
			factorId: number;
			step: number;
			reencrypted: { secretEncrypted: Buffer; keyVersion: number } | null;
	  }
	| { method: SecondFactorMethodEnum.EMAIL }
	| { method: SecondFactorMethodEnum.RECOVERY_CODE; code: string };

function invalidCode(message: string): RejectedRequestError {
	return new RejectedRequestError(AuthErrorCodeEnum.INVALID_CODE, message);
}

/**
 * L'étape « second facteur », après le mot de passe (connexion), ou après le mail (connexion par email, mot de passe
 * oublié, qui ne la passent que si le compte a un TOTP). Chaque échec compte comme un mauvais mot de passe, pour le
 * compte et pour l'IP : relancer des connexions ne donne pas d'essais en plus. Un code accepté ne sert qu'une fois
 */
class SecondFactorService {
	async submit(
		browser: BrowserContextBean,
		answer: SecondFactorAnswer,
	): Promise<FlowOutcomeBean> {
		const { flowToken } = browser;
		const flow = await flowService.findCurrent(flowToken);
		if (flowToken === undefined || flow?.step !== FlowStepEnum.SECOND_FACTOR)
			throw flowExpiredError(
				"No flow waiting for a second factor in this browser",
			);
		const userId = flowService.requireAccount(flow);
		const methods = await flowService.listSecondFactorMethods(flow);
		if (!methods.includes(answer.method))
			throw invalidCode("This step does not offer this method");
		// Aucun email demandé à cette étape : aucun code ne peut être bon, l'essai ne coûte rien
		if (
			answer.method === SecondFactorMethodEnum.EMAIL &&
			flow.codeHmac === null
		)
			throw invalidCode("No email code was sent at this step");

		const attempt = { accountKey: String(userId), ip: browser.client.ip };
		const retryAfterMs = authLimiter.getAttemptRetryAfterMs(attempt);
		if (retryAfterMs !== null)
			throw new TooManyRequestsError(
				"Wait before trying this account again",
				retryAfterMs,
				AuthErrorCodeEnum.TOO_MANY_ATTEMPTS,
			);

		const proof = await this.#verify(flow, userId, answer);
		const nextFlow =
			proof === null
				? null
				: await runInTransaction(
						"Failed to complete the second factor",
						async (transaction) => {
							if (!(await this.#consume(proof, flow, userId, transaction)))
								return null;
							return { bean: await this.#continue(flow, transaction) };
						},
					);
		if (nextFlow === null) {
			authLimiter.recordFailure(attempt);
			await authEventService.record({
				type: AuthEventTypeEnum.SECOND_FACTOR_FAILED,
				userId,
				client: browser.client,
			});
			throw invalidCode("Wrong or already used second factor code");
		}

		authLimiter.recordSuccess(attempt);
		return this.#outcome({ flow, flowToken }, nextFlow.bean, browser);
	}

	/**
	 * Le lien du code par email, ouvert dans le navigateur de la connexion : il vaut le code. Le facteur mail a pu être
	 * retiré depuis l'envoi : le lien ne vaut plus
	 */
	async completeMailLink(
		verified: VerifiedFlowBean,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const { flow } = verified;
		const userId = flowService.requireAccount(flow);
		const methods = await flowService.listSecondFactorMethods(flow);
		if (!methods.includes(SecondFactorMethodEnum.EMAIL))
			throw flowExpiredError("The account no longer has its email factor");

		await flowService.consumeMailStep(verified, async (transaction) => {
			await recordEmailFactorUseQuery(userId, new Date(), transaction);
			if (!(await claimFlowQuery(flow.id, transaction)))
				throw flowExpiredError("The login was completed in the meantime");
		});
		authLimiter.recordSuccess({
			accountKey: String(userId),
			ip: browser.client.ip,
		});
		return this.#outcome(verified, null, browser);
	}

	// null : le code n'est pas bon. Le code par email compte aussi parmi les essais de son mail
	async #verify(
		flow: Flow,
		userId: number,
		{ method, code }: SecondFactorAnswer,
	): Promise<SecondFactorProof | null> {
		if (method === SecondFactorMethodEnum.TOTP)
			return this.#verifyTotp(userId, code);
		if (method === SecondFactorMethodEnum.EMAIL)
			return (await flowService.isMailCodeValid(flow, code))
				? { method }
				: null;
		// Comparé à son usage, dans la transaction : un code de secours ne se vérifie qu'en le consommant
		return { method, code };
	}

	// Le code est essayé sur chaque TOTP du compte : celui qui l'accepte est celui de l'application utilisée
	async #verifyTotp(
		userId: number,
		code: string,
	): Promise<SecondFactorProof | null> {
		const totpFactors = (await findConfirmedFactorsQuery(userId)).filter(
			(factor) => factor.type === FactorTypeEnum.TOTP,
		);
		const nowMs = Date.now();
		for (const factor of totpFactors) {
			const accepted = totpService.check(factor, code, nowMs);
			if (accepted !== null)
				return {
					method: SecondFactorMethodEnum.TOTP,
					factorId: factor.id,
					...accepted,
				};
		}
		return null;
	}

	// false : la preuve a servi entre-temps (même code envoyé deux fois, code de secours inconnu ou déjà utilisé)
	async #consume(
		proof: SecondFactorProof,
		flow: Flow,
		userId: number,
		transaction: Transaction,
	): Promise<boolean> {
		if (proof.method === SecondFactorMethodEnum.TOTP)
			return recordTotpUseQuery(
				{
					factorId: proof.factorId,
					step: proof.step,
					usedAt: new Date(),
					reencrypted: proof.reencrypted,
				},
				transaction,
			);
		if (proof.method === SecondFactorMethodEnum.RECOVERY_CODE)
			return recoveryCodeService.use(userId, proof.code, transaction);
		if (
			flow.linkTokenHash === null ||
			!(await claimFlowMailStepQuery(flow.id, flow.linkTokenHash, transaction))
		)
			return false;
		await recordEmailFactorUseQuery(userId, new Date(), transaction);
		return true;
	}

	// Le mot de passe oublié passe au nouveau mot de passe (son bean) ; une connexion se termine (null)
	async #continue(
		flow: Flow,
		transaction: Transaction,
	): Promise<FlowBean | null> {
		if (flow.kind === FlowKindEnum.PASSWORD_RESET)
			return flowService.advance(
				flow,
				FlowStepEnum.NEW_PASSWORD,
				{ durationMs: authSettings.flowDurationMs.passwordReset },
				transaction,
			);
		if (!(await claimFlowQuery(flow.id, transaction)))
			throw flowExpiredError("The login was completed in the meantime");
		return null;
	}

	async #outcome(
		{ flow, flowToken }: Pick<VerifiedFlowBean, "flow" | "flowToken">,
		nextFlow: FlowBean | null,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const userId = flowService.requireAccount(flow);
		if (nextFlow !== null)
			return {
				isCompleted: false,
				flow: nextFlow,
				flowCookie: { token: flowToken, expiresAt: nextFlow.expiresAt },
			};
		return loginService.openSession(
			userId,
			flow.remember,
			browser,
			AuthEventTypeEnum.LOGIN_SUCCEEDED,
		);
	}
}

export const secondFactorService = new SecondFactorService();

import { computeHmacSha256 } from "@citadel/common/src/node/crypto/computeHmacSha256.ts";
import { createRandomToken } from "@citadel/common/src/node/crypto/createRandomToken.ts";
import { hashSha256 } from "@citadel/common/src/node/crypto/hashSha256.ts";
import { isEqualInConstantTime } from "@citadel/common/src/node/crypto/isEqualInConstantTime.ts";
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
import type { StartFlowBean } from "../bean/startFlowBean.type.ts";
import type { VerifiedFlowBean } from "../bean/verifiedFlowBean.type.ts";
import { listSecondFactorMethods } from "../helper/factor/listSecondFactorMethods.ts";
import { countRemainingMinutes } from "../helper/flow/countRemainingMinutes.ts";
import { createFlowSecrets } from "../helper/flow/createFlowSecrets.ts";
import { flowExpiredError } from "../helper/flow/flowExpiredError.ts";
import { isDecoyFlow } from "../helper/flow/isDecoyFlow.ts";
import { readMailLimitAddress } from "../helper/flow/readMailLimitAddress.ts";
import { authLimiter } from "../limit/authLimiter.ts";
import { fromFlowEntityToFlowBean } from "../mapper/beanEntity/flow/fromFlowEntityToFlowBean.ts";
import type { Flow } from "../models/Flow.ts";
import { findConfirmedFactorTypesQuery } from "../query/factor/findConfirmedFactorTypesQuery.ts";
import { advanceFlowQuery } from "../query/flow/advanceFlowQuery.ts";
import { claimFlowMailStepQuery } from "../query/flow/claimFlowMailStepQuery.ts";
import { createFlowQuery } from "../query/flow/createFlowQuery.ts";
import { deleteFlowByTokenHashQuery } from "../query/flow/deleteFlowByTokenHashQuery.ts";
import { findFlowByLinkTokenHashQuery } from "../query/flow/findFlowByLinkTokenHashQuery.ts";
import { findFlowByTokenHashQuery } from "../query/flow/findFlowByTokenHashQuery.ts";
import { recordFlowCodeAttemptQuery } from "../query/flow/recordFlowCodeAttemptQuery.ts";
import { renewFlowMailQuery } from "../query/flow/renewFlowMailQuery.ts";
import { countUnusedRecoveryCodesQuery } from "../query/recoveryCode/countUnusedRecoveryCodesQuery.ts";
import { flowMailService } from "./flowMailService.ts";

type DescribedFlow = Pick<
	Flow,
	"kind" | "step" | "userId" | "expiresAt" | "lastSentAt" | "attempts"
>;

type SecondFactorStart = {
	userId: number;
	email: string;
	remember: boolean;
	browser: BrowserContextBean;
};

/**
 * Les parcours en plusieurs étapes, chacun lié au navigateur qui l'a commencé par un cookie dont la base ne garde que
 * le SHA-256. Un seul par navigateur. Chaque mail porte un lien (qui ne marche que dans ce navigateur) et un code (qui se
 * tape partout où la page est restée ouverte). Ce service ne connaît que les étapes : ce que fait chaque parcours une
 * fois le mail validé appartient au service de ce parcours
 */
class FlowService {
	// Ce que le navigateur peut savoir du parcours, avec, à l'étape « second facteur », ce que le compte peut y donner
	async describe(flow: DescribedFlow): Promise<FlowBean> {
		return fromFlowEntityToFlowBean(
			flow,
			authSettings.code,
			await this.listSecondFactorMethods(flow),
		);
	}

	// Recalculé à chaque fois : un facteur ajouté ou retiré, un code de secours utilisé ailleurs comptent aussitôt
	async listSecondFactorMethods({
		kind,
		step,
		userId,
	}: Pick<Flow, "kind" | "step" | "userId">): Promise<
		SecondFactorMethodEnum[]
	> {
		if (step !== FlowStepEnum.SECOND_FACTOR || userId === null) return [];
		const [factorTypes, remainingRecoveryCodes] = await Promise.all([
			findConfirmedFactorTypesQuery(userId),
			countUnusedRecoveryCodesQuery(userId),
		]);
		return listSecondFactorMethods({
			kind,
			factorTypes,
			remainingRecoveryCodes,
		});
	}

	// Le parcours du navigateur ; null sans cookie, ou pour un parcours inconnu ou expiré
	async findCurrent(flowToken: string | undefined): Promise<Flow | null> {
		if (flowToken === undefined) return null;
		const flow = await findFlowByTokenHashQuery(hashSha256(flowToken));
		return flow === null || flow.expiresAt <= new Date() ? null : flow;
	}

	async requireCurrent(flowToken: string | undefined): Promise<Flow> {
		const flow = await this.findCurrent(flowToken);
		if (flow === null)
			throw flowExpiredError("No flow in progress in this browser");
		return flow;
	}

	// Sans effet sans parcours
	async abandon(flowToken: string | undefined): Promise<void> {
		if (flowToken !== undefined)
			await deleteFlowByTokenHashQuery(hashSha256(flowToken));
	}

	/**
	 * Un parcours qui commence par un mail. Fermé quand le quota l'est, limité par adresse et par IP. Le parcours d'un
	 * leurre (sans compte) a tout d'un vrai, sauf le code et le lien : aucun mail ne part, aucun code ne passera
	 */
	async start(start: StartFlowBean): Promise<FlowOutcomeBean> {
		await flowMailService.assertOpen(start.kind);
		this.#claimMail(readMailLimitAddress(start), start.browser.client.ip);

		const stepMail = await flowMailService.plan(start);
		const secrets = stepMail.hasSecrets
			? createFlowSecrets(authSettings.code.hmacKey)
			: null;
		const token = createRandomToken();
		const now = new Date();
		const expiresAt = new Date(now.getTime() + start.durationMs);
		const flow = await createFlowQuery(
			{
				tokenHash: hashSha256(token),
				kind: start.kind,
				step: FlowStepEnum.MAIL_CODE,
				userId: start.userId,
				email: start.email,
				payload: start.payload,
				codeHmac: secrets?.codeHmac ?? null,
				linkTokenHash: secrets?.linkTokenHash ?? null,
				remember: start.remember,
				sentAt: now,
				expiresAt,
			},
			{
				browserTokenHash: this.#hashOrNull(start.browser.flowToken),
				// Un leurre ne remplace pas l'inscription en attente d'un autre à cette adresse
				registrationEmail:
					start.kind === FlowKindEnum.REGISTRATION && !isDecoyFlow(start)
						? start.email
						: null,
			},
		);

		flowMailService.send(
			stepMail,
			start,
			secrets,
			countRemainingMinutes(expiresAt, now),
		);
		return {
			isCompleted: false,
			flow: await this.describe(flow),
			flowCookie: { token, expiresAt },
		};
	}

	// La connexion par mot de passe d'un compte protégé : aucun mail ici, le second facteur se choisit ensuite
	async startSecondFactor({
		userId,
		email,
		remember,
		browser,
	}: SecondFactorStart): Promise<FlowOutcomeBean> {
		const token = createRandomToken();
		const expiresAt = new Date(
			Date.now() + authSettings.flowDurationMs.secondFactor,
		);
		const flow = await createFlowQuery(
			{
				tokenHash: hashSha256(token),
				kind: FlowKindEnum.LOGIN,
				step: FlowStepEnum.SECOND_FACTOR,
				userId,
				email,
				payload: null,
				codeHmac: null,
				linkTokenHash: null,
				remember,
				sentAt: null,
				expiresAt,
			},
			{
				browserTokenHash: this.#hashOrNull(browser.flowToken),
				registrationEmail: null,
			},
		);
		return {
			isCompleted: false,
			flow: await this.describe(flow),
			flowCookie: { token, expiresAt },
		};
	}

	/**
	 * Un nouveau mail pour l'étape en cours : nouveau code et nouveau lien, essais remis à zéro. À l'étape « second
	 * facteur », le code par email, quand l'étape le propose. Pas avant le délai de renvoi, ni au-delà des limites de
	 * mails ; un leurre suit les mêmes règles
	 */
	async resend(browser: BrowserContextBean): Promise<FlowOutcomeBean> {
		const flowToken = this.#requireToken(browser);
		const flow = await this.requireCurrent(flowToken);
		// Lues une seule fois : elles disent si l'étape envoie un mail, puis décrivent le parcours
		const secondFactorMethods = await this.listSecondFactorMethods(flow);
		if (
			flow.step !== FlowStepEnum.MAIL_CODE &&
			!secondFactorMethods.includes(SecondFactorMethodEnum.EMAIL)
		)
			throw flowExpiredError("This step of the flow sends no mail");
		await flowMailService.assertOpen(flow.kind);

		const { resendAvailableAt } = fromFlowEntityToFlowBean(
			flow,
			authSettings.code,
			secondFactorMethods,
		);
		const waitMs =
			resendAvailableAt === null ? 0 : resendAvailableAt.getTime() - Date.now();
		if (waitMs > 0)
			throw new TooManyRequestsError("The mail was sent too recently", waitMs);
		this.#claimMail(readMailLimitAddress(flow), browser.client.ip);

		const stepMail = await flowMailService.plan(flow);
		const secrets = stepMail.hasSecrets
			? createFlowSecrets(authSettings.code.hmacKey)
			: null;
		const now = new Date();
		await renewFlowMailQuery({
			flowId: flow.id,
			codeHmac: secrets?.codeHmac ?? null,
			linkTokenHash: secrets?.linkTokenHash ?? null,
			sentAt: now,
		});

		flowMailService.send(
			stepMail,
			flow,
			secrets,
			countRemainingMinutes(flow.expiresAt, now),
		);
		return {
			isCompleted: false,
			flow: fromFlowEntityToFlowBean(
				{ ...flow.get(), attempts: 0, lastSentAt: now },
				authSettings.code,
				secondFactorMethods,
			),
			flowCookie: { token: flowToken, expiresAt: flow.expiresAt },
		};
	}

	/**
	 * Le code tapé à l'étape « lien et code », pour le parcours de ce navigateur. Renvoie le parcours, prêt pour son
	 * étape suivante
	 */
	async verifyCode(
		browser: BrowserContextBean,
		code: string,
	): Promise<VerifiedFlowBean> {
		const flowToken = this.#requireToken(browser);
		const flow = await this.requireCurrent(flowToken);
		if (flow.step !== FlowStepEnum.MAIL_CODE)
			throw new RejectedRequestError(
				AuthErrorCodeEnum.INVALID_CODE,
				"This step of the flow expects no mail code",
			);
		if (!(await this.isMailCodeValid(flow, code)))
			throw new RejectedRequestError(
				AuthErrorCodeEnum.INVALID_CODE,
				"Wrong, used or replaced code",
			);
		return { flow, flowToken, proofKind: "code" };
	}

	/**
	 * Le code du dernier mail du parcours, à n'importe quelle étape qui en envoie. L'essai est compté avant la
	 * comparaison : deux essais simultanés ne passent jamais à deux sous la limite
	 */
	async isMailCodeValid(flow: Flow, code: string): Promise<boolean> {
		if (
			!(await recordFlowCodeAttemptQuery(
				flow.id,
				authSettings.code.maxAttempts,
			))
		)
			throw new RejectedRequestError(
				AuthErrorCodeEnum.CODE_ATTEMPTS_EXHAUSTED,
				"Every attempt of this code is used: a new mail is needed",
			);

		const typedCodeHmac = computeHmacSha256(authSettings.code.hmacKey, code);
		return (
			flow.codeHmac !== null &&
			isEqualInConstantTime(typedCodeHmac, flow.codeHmac)
		);
	}

	/**
	 * Le lien du mail, ouvert puis confirmé par un clic. Il ne vaut que dans le navigateur du parcours : ailleurs, la
	 * page dit d'y taper le code (un inconnu qui commence une connexion avec ton email ne doit pas être connecté par ton
	 * clic). Renvoie le parcours, prêt pour son étape suivante
	 */
	async verifyLink(
		browser: BrowserContextBean,
		linkToken: string,
	): Promise<VerifiedFlowBean> {
		const flow = await findFlowByLinkTokenHashQuery(hashSha256(linkToken));
		if (flow === null || flow.expiresAt <= new Date())
			throw flowExpiredError("Unknown, used, replaced or expired link");
		const { flowToken } = browser;
		if (
			flowToken === undefined ||
			!isEqualInConstantTime(hashSha256(flowToken), flow.tokenHash)
		)
			throw new RejectedRequestError(
				AuthErrorCodeEnum.LINK_OTHER_BROWSER,
				"The link belongs to a flow started in another browser",
			);
		return { flow, flowToken, proofKind: "link" };
	}

	// Le compte d'un parcours dont le mail a été validé. Un leurre n'a ni code ni lien : il n'arrive jamais ici
	requireAccount(flow: Flow): number {
		if (flow.userId === null)
			throw flowExpiredError("This flow belongs to no account");
		return flow.userId;
	}

	/**
	 * Passe l'étape du mail, une seule fois : le code et le lien sont effacés dans la transaction de la suite (`work`).
	 * Si la suite échoue (pseudo pris entre-temps), tout est annulé et ils restent valables. Un renvoi arrivé entre la
	 * vérification et ici a remplacé le code : il est faux, mais le parcours continue
	 */
	async consumeMailStep<Result>(
		{ flow, proofKind }: VerifiedFlowBean,
		work: (transaction: Transaction) => Promise<Result>,
	): Promise<Result> {
		const { linkTokenHash } = flow;
		return runInTransaction(
			"Failed to complete the mail step",
			async (transaction) => {
				if (
					linkTokenHash === null ||
					!(await claimFlowMailStepQuery(flow.id, linkTokenHash, transaction))
				)
					throw proofKind === "code"
						? new RejectedRequestError(
								AuthErrorCodeEnum.INVALID_CODE,
								"The code was used or replaced in the meantime",
							)
						: flowExpiredError("The link was used or replaced in the meantime");
				return work(transaction);
			},
		);
	}

	/**
	 * Le parcours continue à l'étape donnée, pour la durée donnée, comptée d'ici. Rien n'est lu en base dans la
	 * transaction de l'appelant : vers le second facteur, ses méthodes ont été lues avant (`listSecondFactorMethods`)
	 */
	async advance(
		flow: Flow,
		step: FlowStepEnum,
		{
			durationMs,
			secondFactorMethods = [],
		}: { durationMs: number; secondFactorMethods?: SecondFactorMethodEnum[] },
		transaction: Transaction,
	): Promise<FlowBean> {
		const expiresAt = new Date(Date.now() + durationMs);
		await advanceFlowQuery({ flowId: flow.id, step, expiresAt }, transaction);
		return fromFlowEntityToFlowBean(
			{ kind: flow.kind, step, expiresAt, attempts: 0, lastSentAt: null },
			authSettings.code,
			secondFactorMethods,
		);
	}

	#requireToken({ flowToken }: BrowserContextBean): string {
		if (flowToken === undefined)
			throw flowExpiredError("No flow in progress in this browser");
		return flowToken;
	}

	#claimMail(address: string, ip: string): void {
		const retryAfterMs = authLimiter.claimMail({ email: address, ip });
		if (retryAfterMs !== null)
			throw new TooManyRequestsError(
				"Too many authentication mails for this address or this IP",
				retryAfterMs,
			);
	}

	#hashOrNull(token: string | undefined): Buffer | null {
		return token === undefined ? null : hashSha256(token);
	}
}

export const flowService = new FlowService();

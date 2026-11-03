import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { authSettings } from "../../../configuration/authSettings.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import { RejectedRequestError } from "../../../error/RejectedRequestError.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import type { BrowserContextBean } from "../bean/browserContextBean.type.ts";
import type { ClientContextBean } from "../bean/clientContextBean.type.ts";
import type { FlowOutcomeBean } from "../bean/flowOutcomeBean.type.ts";
import type { TotpFactorSetupBean } from "../bean/totpFactorSetupBean.type.ts";
import type { VerifiedFlowBean } from "../bean/verifiedFlowBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { confirmFactorQuery } from "../query/factor/confirmFactorQuery.ts";
import { createFactorQuery } from "../query/factor/createFactorQuery.ts";
import { findConfirmedFactorTypesQuery } from "../query/factor/findConfirmedFactorTypesQuery.ts";
import { findPendingTotpFactorQuery } from "../query/factor/findPendingTotpFactorQuery.ts";
import { writeFactorSecretQuery } from "../query/factor/writeFactorSecretQuery.ts";
import { claimFlowQuery } from "../query/flow/claimFlowQuery.ts";
import { findUserByIdQuery } from "../query/user/findUserByIdQuery.ts";
import { lockUserQuery } from "../query/user/lockUserQuery.ts";
import { buildSecurityNoticeMail } from "../template/buildSecurityNoticeMail.ts";
import { buildOtpauthUri } from "../totp/buildOtpauthUri.ts";
import { encodeBase32 } from "../totp/encodeBase32.ts";
import { authEventService } from "./authEventService.ts";
import { authMailService } from "./authMailService.ts";
import { flowService } from "./flowService.ts";
import { recoveryCodeService } from "./recoveryCodeService.ts";
import { totpService } from "./totpService.ts";

// Le compte n'en a qu'un : son nom est toujours celui-là
const EMAIL_FACTOR_NAME = "Code par email";

function factorNotFound(message: string): NotFoundError {
	return new NotFoundError(AuthErrorCodeEnum.FACTOR_NOT_FOUND, message);
}

function emailFactorAlreadyActive(): ConflictError {
	return new ConflictError(
		AuthErrorCodeEnum.EMAIL_FACTOR_ALREADY_ACTIVE,
		"The account already has its email factor",
	);
}

async function requireUser(userId: number) {
	const user = await findUserByIdQuery(userId);
	if (user === null) throw new Error("Session of a deleted account");
	return user;
}

/**
 * Les seconds facteurs du compte connecté : des TOTP nommés, autant que voulu, et un seul facteur mail. Un facteur ne
 * protège rien tant que son premier code n'est pas validé. Le premier activé donne les codes de secours : chaque
 * changement verrouille le compte, deux activations simultanées ne donnent jamais deux lots de codes. Chaque ajout est
 * notifié à l'adresse du compte
 */
class FactorService {
	// Un secret neuf, chiffré avec l'id de son facteur : le facteur se crée d'abord, sans secret, dans la même transaction
	async createTotp(userId: number, name: string): Promise<TotpFactorSetupBean> {
		const user = await requireUser(userId);
		const secret = totpService.createSecret();
		const factorId = await runInTransaction(
			"Failed to create TOTP factor",
			async (transaction) => {
				const createdId = await createFactorQuery(
					{ userId, type: FactorTypeEnum.TOTP, name, confirmedAt: null },
					transaction,
				);
				if (createdId === null) throw new Error("TOTP factors are not unique");
				await writeFactorSecretQuery(
					{ factorId: createdId, ...totpService.encrypt(secret, createdId) },
					transaction,
				);
				return createdId;
			},
		);

		const secretBase32 = encodeBase32(secret);
		return {
			factorId,
			secretBase32,
			otpauthUri: buildOtpauthUri({
				issuer: authSettings.totp.issuer,
				accountName: user.email,
				secretBase32,
			}),
		};
	}

	// Le premier code de l'application active le TOTP ; il ne resservira pas pour se connecter
	async confirmTotp(
		userId: number,
		{ factorId, code }: { factorId: number; code: string },
		client: ClientContextBean,
	): Promise<string[] | null> {
		const factor = await findPendingTotpFactorQuery({
			userId,
			factorId,
			createdAfter: new Date(Date.now() - authSettings.factorConfirmationMs),
		});
		if (factor === null)
			throw factorNotFound("No TOTP of this account waits for its first code");
		const accepted = totpService.check(factor, code, Date.now());
		if (accepted === null)
			throw new RejectedRequestError(
				AuthErrorCodeEnum.INVALID_CODE,
				"Wrong TOTP code",
			);

		const recoveryCodes = await runInTransaction(
			"Failed to confirm TOTP factor",
			async (transaction) => {
				await lockUserQuery(userId, transaction);
				if (
					!(await confirmFactorQuery(
						{ factorId, usedStep: accepted.step, confirmedAt: new Date() },
						transaction,
					))
				)
					throw factorNotFound("The TOTP was confirmed in the meantime");
				return recoveryCodeService.issueForFirstFactor(userId, transaction);
			},
		);
		await this.#notifyAdded(userId, client);
		return recoveryCodes;
	}

	// Le facteur mail s'active par un mail à l'adresse du compte : son lien ou son code prouve que la boîte répond
	async startEmailFactor(
		userId: number,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const user = await requireUser(userId);
		const factorTypes = await findConfirmedFactorTypesQuery(userId);
		if (factorTypes.includes(FactorTypeEnum.EMAIL))
			throw emailFactorAlreadyActive();
		return flowService.start({
			kind: FlowKindEnum.EMAIL_FACTOR,
			userId,
			email: user.email,
			payload: null,
			remember: false,
			durationMs: authSettings.factorConfirmationMs,
			browser,
		});
	}

	/**
	 * Le mail d'activation validé : le facteur mail est actif, le parcours terminé, sans nouvelle session (le compte
	 * était connecté pour le demander). Activé entre-temps depuis un autre onglet : 409, sans second facteur mail
	 */
	async completeEmailFactorMailStep(
		verified: VerifiedFlowBean,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const { flow } = verified;
		const userId = flowService.requireAccount(flow);
		const recoveryCodes = await flowService.consumeMailStep(
			verified,
			async (transaction) => {
				await lockUserQuery(userId, transaction);
				const factorId = await createFactorQuery(
					{
						userId,
						type: FactorTypeEnum.EMAIL,
						name: EMAIL_FACTOR_NAME,
						confirmedAt: new Date(),
					},
					transaction,
				);
				if (factorId === null) throw emailFactorAlreadyActive();
				await claimFlowQuery(flow.id, transaction);
				return recoveryCodeService.issueForFirstFactor(userId, transaction);
			},
		);
		await this.#notifyAdded(userId, browser.client);
		return { isCompleted: true, sessionCookie: null, recoveryCodes };
	}

	async #notifyAdded(userId: number, client: ClientContextBean): Promise<void> {
		const user = await requireUser(userId);
		authMailService.sendWithoutWaiting(
			buildSecurityNoticeMail(
				MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_ADDED,
				user.email,
			),
		);
		await authEventService.record({
			type: AuthEventTypeEnum.SECOND_FACTOR_ADDED,
			userId,
			client,
		});
	}
}

export const factorService = new FactorService();

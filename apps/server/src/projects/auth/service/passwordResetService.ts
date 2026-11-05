import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { authSettings } from "../../../configuration/authSettings.ts";
import { RejectedRequestError } from "../../../error/RejectedRequestError.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import type { BrowserContextBean } from "../bean/browserContextBean.type.ts";
import type { FlowOutcomeBean } from "../bean/flowOutcomeBean.type.ts";
import type { VerifiedFlowBean } from "../bean/verifiedFlowBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { RestoreJournalActionEnum } from "../enum/restoreJournalAction.enum.ts";
import { claimFlowQuery } from "../query/flow/claimFlowQuery.ts";
import { deleteSessionsOfUserQuery } from "../query/session/deleteSessionsOfUserQuery.ts";
import { findUserByIdQuery } from "../query/user/findUserByIdQuery.ts";
import { updateUserPasswordQuery } from "../query/user/updateUserPasswordQuery.ts";
import { buildSecurityNoticeMail } from "../template/buildSecurityNoticeMail.ts";
import { authEventService } from "./authEventService.ts";
import { authMailService } from "./authMailService.ts";
import { flowService } from "./flowService.ts";
import { loginService } from "./loginService.ts";
import { passwordService } from "./passwordService.ts";
import { restoreJournalService } from "./restoreJournalService.ts";
import { userService } from "./userService.ts";

function flowExpired(): RejectedRequestError {
	return new RejectedRequestError(
		AuthErrorCodeEnum.FLOW_EXPIRED,
		"No password reset waiting for a new password in this browser",
	);
}

/**
 * Mot de passe oublié : le mail à l'adresse du compte (jamais affichée), puis le TOTP s'il existe, jamais le code par
 * mail (une boîte compromise suffirait sinon à contourner la double authentification), puis le nouveau mot de passe.
 * Toujours ouvert, quelles que soient les méthodes de connexion du compte
 */
class PasswordResetService {
	// Identifiant inconnu : un parcours leurre, même réponse, aucun mail
	async start(
		identifier: string,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const user = await userService.findByIdentifier(identifier);
		return flowService.start({
			kind: FlowKindEnum.PASSWORD_RESET,
			userId: user?.id ?? null,
			email: user?.email ?? identifier,
			payload: { identifier },
			remember: false,
			durationMs: authSettings.flowDurationMs.passwordReset,
			browser,
		});
	}

	// La boîte est prouvée : le TOTP s'il existe, sinon le nouveau mot de passe
	async completeMailStep(verified: VerifiedFlowBean): Promise<FlowOutcomeBean> {
		const { flow, flowToken } = verified;
		const userId = flowService.requireAccount(flow);
		const secondFactorMethods = await flowService.listSecondFactorMethods({
			kind: flow.kind,
			step: FlowStepEnum.SECOND_FACTOR,
			userId,
		});
		const nextFlow = await flowService.consumeMailStep(
			verified,
			async (transaction) =>
				secondFactorMethods.includes(SecondFactorMethodEnum.TOTP)
					? flowService.advance(
							flow,
							FlowStepEnum.SECOND_FACTOR,
							{
								durationMs: authSettings.flowDurationMs.secondFactor,
								secondFactorMethods,
							},
							transaction,
						)
					: flowService.advance(
							flow,
							FlowStepEnum.NEW_PASSWORD,
							{ durationMs: authSettings.flowDurationMs.passwordReset },
							transaction,
						),
		);
		return {
			isCompleted: false,
			flow: nextFlow,
			flowCookie: { token: flowToken, expiresAt: nextFlow.expiresAt },
		};
	}

	/**
	 * Le nouveau mot de passe, différent de l'actuel. Toutes les sessions du compte sont fermées (un voleur du mot de
	 * passe perd la sienne), puis celle de ce navigateur s'ouvre, et le compte est prévenu par mail
	 */
	async setNewPassword(
		password: string,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const flow = await flowService.findCurrent(browser.flowToken);
		if (
			flow?.kind !== FlowKindEnum.PASSWORD_RESET ||
			flow.step !== FlowStepEnum.NEW_PASSWORD
		)
			throw flowExpired();
		const user = await findUserByIdQuery(flowService.requireAccount(flow));
		if (user === null) throw flowExpired();

		if (await passwordService.verify(password, user.passwordHash))
			throw new RejectedRequestError(
				AuthErrorCodeEnum.PASSWORD_UNCHANGED,
				"The new password is the current one",
			);
		const passwordHash = await passwordService.hash(password);
		await runInTransaction("Failed to reset password", async (transaction) => {
			if (!(await claimFlowQuery(flow.id, transaction))) throw flowExpired();
			await updateUserPasswordQuery(
				{ userId: user.id, passwordHash, changedAt: new Date() },
				transaction,
			);
			await deleteSessionsOfUserQuery(user.id, transaction);
		});

		authMailService.sendWithoutWaiting(
			buildSecurityNoticeMail(
				MailKindEnum.AUTH_NOTICE_PASSWORD_CHANGED,
				user.email,
			),
		);
		await restoreJournalService.record({
			userId: user.id,
			action: RestoreJournalActionEnum.SECURITY_CHANGED,
		});
		await authEventService.record({
			type: AuthEventTypeEnum.PASSWORD_CHANGED,
			userId: user.id,
			client: browser.client,
		});
		return loginService.openSession(
			user.id,
			flow.remember,
			// Déjà supprimée avec les autres
			{ ...browser, sessionToken: undefined },
			AuthEventTypeEnum.LOGIN_SUCCEEDED,
		);
	}
}

export const passwordResetService = new PasswordResetService();

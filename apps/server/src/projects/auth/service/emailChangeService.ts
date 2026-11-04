import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";

import { authSettings } from "../../../configuration/authSettings.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import type { BrowserContextBean } from "../bean/browserContextBean.type.ts";
import type { FlowOutcomeBean } from "../bean/flowOutcomeBean.type.ts";
import type { VerifiedFlowBean } from "../bean/verifiedFlowBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { claimFlowQuery } from "../query/flow/claimFlowQuery.ts";
import { findUserByIdQuery } from "../query/user/findUserByIdQuery.ts";
import { lockUserQuery } from "../query/user/lockUserQuery.ts";
import { updateUserEmailQuery } from "../query/user/updateUserEmailQuery.ts";
import { buildSecurityNoticeMail } from "../template/buildSecurityNoticeMail.ts";
import { authEventService } from "./authEventService.ts";
import { authMailService } from "./authMailService.ts";
import { flowService } from "./flowService.ts";
import { passwordConfirmationService } from "./passwordConfirmationService.ts";

/**
 * Le changement d'adresse email du compte connecté : mot de passe redemandé, puis un mail (lien + code) à la nouvelle
 * adresse. Elle ne remplace l'ancienne qu'une fois confirmée, et l'ancienne en est prévenue. Adresse déjà inscrite :
 * même réponse, et son mail dit seulement qu'un autre compte l'a voulue (voir FlowMailService)
 */
class EmailChangeService {
	async start(
		userId: number,
		{ password, newEmail }: { password: string; newEmail: string },
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		await passwordConfirmationService.confirm(userId, password, browser.client);
		return flowService.start({
			kind: FlowKindEnum.EMAIL_CHANGE,
			userId,
			email: newEmail,
			payload: { newEmail },
			remember: false,
			durationMs: authSettings.flowDurationMs.emailChange,
			browser,
		});
	}

	/**
	 * L'adresse est prouvée : elle remplace celle du compte, sans nouvelle session. Prise entre la demande et ici : 409,
	 * le parcours reste ouvert. L'ancienne adresse est prévenue
	 */
	async completeMailStep(
		verified: VerifiedFlowBean,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const { flow } = verified;
		const userId = flowService.requireAccount(flow);
		const newEmail = flow.email;
		const user = await findUserByIdQuery(userId);
		if (user === null) throw new Error("Email change of a deleted account");
		const previousEmail = user.email;

		await flowService.consumeMailStep(verified, async (transaction) => {
			await lockUserQuery(userId, transaction);
			await updateUserEmailQuery({ userId, email: newEmail }, transaction);
			await claimFlowQuery(flow.id, transaction);
		});

		authMailService.sendWithoutWaiting(
			buildSecurityNoticeMail(
				MailKindEnum.AUTH_NOTICE_EMAIL_CHANGED,
				previousEmail,
			),
		);
		await authEventService.record({
			type: AuthEventTypeEnum.EMAIL_CHANGED,
			userId,
			client: browser.client,
		});
		return { isCompleted: true, sessionCookie: null, recoveryCodes: null };
	}
}

export const emailChangeService = new EmailChangeService();

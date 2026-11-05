import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { RejectedRequestError } from "../../../error/RejectedRequestError.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import type { ClientContextBean } from "../bean/clientContextBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { RestoreJournalActionEnum } from "../enum/restoreJournalAction.enum.ts";
import { deleteOtherSessionsOfUserQuery } from "../query/session/deleteOtherSessionsOfUserQuery.ts";
import { updateUserPasswordQuery } from "../query/user/updateUserPasswordQuery.ts";
import { buildSecurityNoticeMail } from "../template/buildSecurityNoticeMail.ts";
import { authEventService } from "./authEventService.ts";
import { authMailService } from "./authMailService.ts";
import { passwordConfirmationService } from "./passwordConfirmationService.ts";
import { passwordService } from "./passwordService.ts";
import { restoreJournalService } from "./restoreJournalService.ts";

type PasswordChange = {
	userId: number;
	// La session d'où le mot de passe est changé : la seule qui reste ouverte
	sessionId: number;
	currentPassword: string;
	newPassword: string;
};

/**
 * Le mot de passe changé depuis le profil : l'actuel redemandé, un nouveau différent. Les autres sessions du compte
 * sont fermées (un voleur du mot de passe perd la sienne), celle-ci reste ouverte, et le compte est prévenu par mail
 */
class PasswordChangeService {
	async change(
		{ userId, sessionId, currentPassword, newPassword }: PasswordChange,
		client: ClientContextBean,
	): Promise<void> {
		const user = await passwordConfirmationService.confirm(
			userId,
			currentPassword,
			client,
		);
		if (await passwordService.verify(newPassword, user.passwordHash))
			throw new RejectedRequestError(
				AuthErrorCodeEnum.PASSWORD_UNCHANGED,
				"The new password is the current one",
			);

		const passwordHash = await passwordService.hash(newPassword);
		await runInTransaction("Failed to change password", async (transaction) => {
			await updateUserPasswordQuery(
				{ userId, passwordHash, changedAt: new Date() },
				transaction,
			);
			await deleteOtherSessionsOfUserQuery(
				{ userId, keptSessionId: sessionId },
				transaction,
			);
			await restoreJournalService.write(
				{ userId, action: RestoreJournalActionEnum.SECURITY_CHANGED },
				transaction,
			);
		});

		authMailService.sendWithoutWaiting(
			buildSecurityNoticeMail(
				MailKindEnum.AUTH_NOTICE_PASSWORD_CHANGED,
				user.email,
			),
		);
		await authEventService.record({
			type: AuthEventTypeEnum.PASSWORD_CHANGED,
			userId,
			client,
		});
	}
}

export const passwordChangeService = new PasswordChangeService();

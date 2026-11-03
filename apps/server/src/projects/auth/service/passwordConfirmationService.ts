import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { RejectedRequestError } from "../../../error/RejectedRequestError.ts";
import { TooManyRequestsError } from "../../../error/TooManyRequestsError.ts";
import type { ClientContextBean } from "../bean/clientContextBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { authLimiter } from "../limit/authLimiter.ts";
import type { User } from "../models/User.ts";
import { findUserByIdQuery } from "../query/user/findUserByIdQuery.ts";
import { authEventService } from "./authEventService.ts";
import { passwordService } from "./passwordService.ts";

/**
 * Le mot de passe redemandé avant une action sensible (retirer un facteur, refaire les codes de secours…). Ses échecs
 * comptent comme ceux de la connexion, pour le compte et pour l'IP : une session volée ne sert pas à deviner le mot de
 * passe
 */
class PasswordConfirmationService {
	async confirm(
		userId: number,
		password: string,
		client: ClientContextBean,
	): Promise<User> {
		const attempt = { accountKey: String(userId), ip: client.ip };
		const retryAfterMs = authLimiter.getAttemptRetryAfterMs(attempt);
		if (retryAfterMs !== null)
			throw new TooManyRequestsError(
				"Wait before trying this password again",
				retryAfterMs,
				AuthErrorCodeEnum.TOO_MANY_ATTEMPTS,
			);

		const user = await findUserByIdQuery(userId);
		if (user === null) throw new Error("Session of a deleted account");
		if (!(await passwordService.verify(password, user.passwordHash))) {
			authLimiter.recordFailure(attempt);
			await authEventService.record({
				type: AuthEventTypeEnum.PASSWORD_CONFIRMATION_FAILED,
				userId,
				client,
			});
			throw new RejectedRequestError(
				AuthErrorCodeEnum.WRONG_PASSWORD,
				"Wrong password",
			);
		}
		authLimiter.recordSuccess(attempt);
		return user;
	}
}

export const passwordConfirmationService = new PasswordConfirmationService();

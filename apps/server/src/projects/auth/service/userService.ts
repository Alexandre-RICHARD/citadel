import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";

import { TooManyRequestsError } from "../../../error/TooManyRequestsError.ts";
import { UnauthorizedError } from "../../../error/UnauthorizedError.ts";
import type { MeBean } from "../bean/meBean.type.ts";
import { authLimiter } from "../limit/authLimiter.ts";
import { fromUserEntityToMeBean } from "../mapper/beanEntity/user/fromUserEntityToMeBean.ts";
import type { User } from "../models/User.ts";
import { findUserByEmailQuery } from "../query/user/findUserByEmailQuery.ts";
import { findUserByIdQuery } from "../query/user/findUserByIdQuery.ts";
import { findUserByUsernameQuery } from "../query/user/findUserByUsernameQuery.ts";

class UserService {
	// Le compte supprimé emporte ses sessions (cascade) ; s'il disparaît pendant la requête, elle n'est plus connectée
	async getMe(userId: number): Promise<MeBean> {
		const user = await findUserByIdQuery(userId);
		if (user === null)
			throw new UnauthorizedError(
				TechnicalErrorCodeEnum.AUTHENTICATION_REQUIRED,
				"The account of the session no longer exists",
			);
		return fromUserEntityToMeBean(user);
	}

	// L'identifiant tapé pour se connecter : avec « @ », un email (un pseudo n'en contient jamais), sinon un pseudo
	async findByIdentifier(identifier: string): Promise<User | null> {
		return identifier.includes("@")
			? findUserByEmailQuery(identifier)
			: findUserByUsernameQuery(identifier);
	}

	async isUsernameTaken(username: string): Promise<boolean> {
		return (await findUserByUsernameQuery(username)) !== null;
	}

	// Limité par IP : les pseudos sont publics, mais un robot ne doit pas tous les lister
	async isUsernameAvailable(username: string, ip: string): Promise<boolean> {
		const retryAfterMs = authLimiter.claimUsernameCheck(ip);
		if (retryAfterMs !== null)
			throw new TooManyRequestsError(
				"Too many username checks from this IP",
				retryAfterMs,
			);
		return !(await this.isUsernameTaken(username));
	}
}

export const userService = new UserService();

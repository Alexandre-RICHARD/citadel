import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { UnauthorizedError } from "../../../error/UnauthorizedError.ts";
import type { MeBean } from "../bean/meBean.type.ts";
import { fromUserEntityToMeBean } from "../mapper/beanEntity/user/fromUserEntityToMeBean.ts";
import { findUserByIdQuery } from "../query/user/findUserByIdQuery.ts";

class UserService {
	// Le compte supprimé emporte ses sessions (cascade) ; s'il disparaît pendant la requête, elle n'est plus connectée
	async getMe(userId: number): Promise<MeBean> {
		const user = await findUserByIdQuery(userId);
		if (user === null)
			throw new UnauthorizedError(
				AuthErrorCodeEnum.AUTHENTICATION_REQUIRED,
				"The account of the session no longer exists",
			);
		return fromUserEntityToMeBean(user);
	}
}

export const userService = new UserService();

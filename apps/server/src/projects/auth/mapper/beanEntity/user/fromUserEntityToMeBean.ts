import type { MeBean } from "../../../bean/meBean.type.ts";
import type { User } from "../../../models/User.ts";

export function fromUserEntityToMeBean(user: User): MeBean {
	return {
		email: user.email,
		username: user.username,
		displayName: user.displayName,
		loginMethods: user.loginMethods,
	};
}

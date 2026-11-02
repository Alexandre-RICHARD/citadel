import type { MeDto } from "@citadel/specs/src/projects/auth/dto/meDto.type.ts";

import type { MeBean } from "../../../bean/meBean.type.ts";

export function fromMeBeanToMeDto(me: MeBean): MeDto {
	return {
		email: me.email,
		username: me.username,
		displayName: me.displayName,
		loginMethods: me.loginMethods,
	};
}

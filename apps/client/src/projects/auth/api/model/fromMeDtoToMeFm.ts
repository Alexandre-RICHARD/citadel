import type { MeDto } from "@citadel/specs/src/projects/auth/dto/meDto.type";

import type { MeFm } from "./meFm.type";

export function fromMeDtoToMeFm(me: MeDto): MeFm {
	return {
		email: me.email,
		username: me.username,
		displayName: me.displayName ?? me.username,
		customDisplayName: me.displayName,
		loginMethods: me.loginMethods,
	};
}

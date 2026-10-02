import type { SetBossDefeatedBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedBodyDto.type.ts";
import type { SetBossDefeatedPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedPathParamDto.type.ts";

import type { SetBossDefeatedBean } from "../../../bean/setBossDefeatedBean.type.ts";

export function fromSetBossDefeatedDtoToSetBossDefeatedBean(
	setBossDefeatedPathParamDto: SetBossDefeatedPathParamDto,
	setBossDefeatedBodyDto: SetBossDefeatedBodyDto,
): SetBossDefeatedBean {
	const setBossDefeatedBean = {
		id: setBossDefeatedPathParamDto.id,
		defeated: setBossDefeatedBodyDto.defeated,
	};
	return setBossDefeatedBean;
}

import type { SetBossDefeatedBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedBodyDto.ts";
import type { SetBossDefeatedPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedPathParamDto.ts";

import type { SetBossDefeatedBean } from "../../../bean/setBossDefeatedBean.ts";

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

import type { SetBossDefeatedBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedBody.dto.ts";
import type { SetBossDefeatedPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedPathParam.dto.ts";

import type { SetBossDefeatedBean } from "../../../bean/setBossDefeated.bean.ts";

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

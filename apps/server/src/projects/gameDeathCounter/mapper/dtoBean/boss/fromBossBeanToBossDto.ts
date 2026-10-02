import type { BossDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossDto.ts";

import type { BossBean } from "../../../bean/bossBean.ts";
import { fromDeathBeanToDeathDto } from "../death/fromDeathBeanToDeathDto.ts";
import { fromBossSummaryBeanToBossSummaryDto } from "./fromBossSummaryBeanToBossSummaryDto.ts";

export function fromBossBeanToBossDto(bossBean: BossBean): BossDto {
	const bossDto = {
		...fromBossSummaryBeanToBossSummaryDto(bossBean),
		deaths: bossBean.deaths.map(fromDeathBeanToDeathDto),
	};
	return bossDto;
}

import { mapNullableDateToStringOrNull } from "@citadel/common/src/universal/date/mapNullableDateToStringOrNull.ts";
import type { BossSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossSummaryDto.type.ts";

import type { BossSummaryBean } from "../../../bean/bossSummaryBean.type.ts";

export function fromBossSummaryBeanToBossSummaryDto(
	bossSummaryBean: BossSummaryBean,
): BossSummaryDto {
	const bossSummaryDto = {
		id: bossSummaryBean.id,
		name: bossSummaryBean.name,
		firstTry: mapNullableDateToStringOrNull(bossSummaryBean.firstTry),
		lastTry: mapNullableDateToStringOrNull(bossSummaryBean.lastTry),
		defeatedAt: mapNullableDateToStringOrNull(bossSummaryBean.defeatedAt),
		totalDeath: bossSummaryBean.totalDeath,
	};
	return bossSummaryDto;
}

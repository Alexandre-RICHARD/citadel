import type { BossSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossSummary.dto.ts";

import { mapNullableDateToStringOrNull } from "../../../../../common/date/mapNullableDateToStringOrNull.ts";
import type { BossSummaryBean } from "../../../bean/bossSummary.bean.ts";

// TODO Analyse
export function fromBossSummaryBeanToBossSummaryDto(
	bossSummaryBean: BossSummaryBean,
): BossSummaryDto {
	const bossSummaryDto = {
		id: bossSummaryBean.id,
		gameId: bossSummaryBean.gameId,
		name: bossSummaryBean.name,
		firstTry: mapNullableDateToStringOrNull(bossSummaryBean.firstTry),
		lastTry: mapNullableDateToStringOrNull(bossSummaryBean.lastTry),
		defeatedAt: mapNullableDateToStringOrNull(bossSummaryBean.defeatedAt),
		totalDeath: bossSummaryBean.totalDeath,
	};
	return bossSummaryDto;
}

import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummary.dto.ts";

import { mapDateToString } from "../../../../../common/date/mapDateToString.ts";
import { mapNullableDateToStringOrNull } from "../../../../../common/date/mapNullableDateToStringOrNull.ts";
import type { GameSummaryBean } from "../../../bean/gameSummary.bean.ts";

export function fromGameSummaryBeanToGameSummaryDto(
	gameSummaryBean: GameSummaryBean,
): GameSummaryDto {
	const gameSummaryDto = {
		id: gameSummaryBean.id,
		name: gameSummaryBean.name,
		startedAt: mapDateToString(gameSummaryBean.startedAt),
		endedAt: mapNullableDateToStringOrNull(gameSummaryBean.endedAt),
		totalDeath: gameSummaryBean.totalDeath,
	};
	return gameSummaryDto;
}

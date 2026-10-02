import { mapDateToString } from "@citadel/common/src/universal/date/mapDateToString.ts";
import { mapNullableDateToStringOrNull } from "@citadel/common/src/universal/date/mapNullableDateToStringOrNull.ts";
import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type.ts";

import type { GameSummaryBean } from "../../../bean/gameSummaryBean.type.ts";

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

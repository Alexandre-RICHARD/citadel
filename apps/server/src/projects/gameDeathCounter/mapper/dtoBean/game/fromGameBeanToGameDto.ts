import { mapDateToString } from "@citadel/common/src/universal/date/mapDateToString.ts";
import { mapNullableDateToStringOrNull } from "@citadel/common/src/universal/date/mapNullableDateToStringOrNull.ts";
import type { GameDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameDto.type.ts";

import type { GameBean } from "../../../bean/gameBean.type.ts";
import { fromBossSummaryBeanToBossSummaryDto } from "../boss/fromBossSummaryBeanToBossSummaryDto.ts";

export function fromGameBeanToGameDto(gameBean: GameBean): GameDto {
	const gameDto = {
		id: gameBean.id,
		name: gameBean.name,
		startedAt: mapDateToString(gameBean.startedAt),
		endedAt: mapNullableDateToStringOrNull(gameBean.endedAt),
		totalDeath: gameBean.totalDeath,
		bosses: gameBean.bosses.map(fromBossSummaryBeanToBossSummaryDto),
	};
	return gameDto;
}

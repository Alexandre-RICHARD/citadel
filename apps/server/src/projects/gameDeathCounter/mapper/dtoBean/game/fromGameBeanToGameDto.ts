import type { GameDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/game.dto.ts";

import { mapDateToString } from "../../../../../common/date/mapDateToString.ts";
import { mapNullableDateToStringOrNull } from "../../../../../common/date/mapNullableDateToStringOrNull.ts";
import type { GameBean } from "../../../bean/game.bean.ts";
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

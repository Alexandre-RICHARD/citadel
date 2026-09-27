import type { GameListDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameList.dto.ts";

import type { GameSummaryBean } from "../../../bean/gameSummary.bean.ts";
import { fromGameSummaryBeanToGameSummaryDto } from "./fromGameSummaryBeanToGameSummaryDto.ts";

export function fromGameSummaryBeanListToGameListDto(
	gameSummaryBeans: GameSummaryBean[],
): GameListDto {
	const gameListDto = {
		games: gameSummaryBeans.map(fromGameSummaryBeanToGameSummaryDto),
	};
	return gameListDto;
}

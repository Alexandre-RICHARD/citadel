import type { GameListDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameListDto.ts";

import type { GameSummaryBean } from "../../../bean/gameSummaryBean.ts";
import { fromGameSummaryBeanToGameSummaryDto } from "./fromGameSummaryBeanToGameSummaryDto.ts";

export function fromGameSummaryBeanListToGameListDto(
	gameSummaryBeans: GameSummaryBean[],
): GameListDto {
	const gameListDto = {
		games: gameSummaryBeans.map(fromGameSummaryBeanToGameSummaryDto),
	};
	return gameListDto;
}

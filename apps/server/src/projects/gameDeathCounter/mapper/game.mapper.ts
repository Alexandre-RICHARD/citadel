import type { GameListDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameList.dto.ts";
import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummary.dto.ts";

import { mapDateToString } from "../../../common/date/mapDateToString.ts";
import { mapNullableDateToStringOrNull } from "../../../common/date/mapNullableDateToStringOrNull.ts";
import type { GameSummaryBean } from "../bean/gameSummaryBean.ts";
import type { Game } from "../models/Game.ts";

export const gameMapper = {
	fromGameEntityToGameSummaryBean: (game: Game): GameSummaryBean => {
		const gameSummaryBean = {
			id: game.id,
			name: game.name,
			startedAt: game.createdAt,
			endedAt: game.endedAt,
			totalDeath: 0, // TODO TOTAL DEATH
		};
		return gameSummaryBean;
	},

	fromGameEntityListToGameSummaryBeanList: (
		game: Game[],
	): GameSummaryBean[] => {
		const gameSummaryBeanList = game.map(
			gameMapper.fromGameEntityToGameSummaryBean,
		);
		return gameSummaryBeanList;
	},

	fromGameSummaryBeanToGameSummaryDto: (
		gameSummaryBean: GameSummaryBean,
	): GameSummaryDto => {
		const gameSummaryDto = {
			id: gameSummaryBean.id,
			name: gameSummaryBean.name,
			startedAt: mapDateToString(gameSummaryBean.startedAt),
			endedAt: mapNullableDateToStringOrNull(gameSummaryBean.endedAt),
			totalDeath: gameSummaryBean.totalDeath,
		};
		return gameSummaryDto;
	},

	fromGameSummaryBeanListToGameListDto: (
		gameSummaryBeans: GameSummaryBean[],
	): GameListDto => {
		const gameListDto = {
			games: gameSummaryBeans.map(
				gameMapper.fromGameSummaryBeanToGameSummaryDto,
			),
		};
		return gameListDto;
	},
};

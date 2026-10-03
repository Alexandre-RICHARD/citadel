import { dateNow } from "@citadel/common/src/universal/date/dateNow.ts";
import { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum.ts";

import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { CreateGameBean } from "../bean/createGameBean.type.ts";
import type { DeleteGameBean } from "../bean/deleteGameBean.type.ts";
import type { GameBean } from "../bean/gameBean.type.ts";
import type { GameSummaryBean } from "../bean/gameSummaryBean.type.ts";
import type { GetOneGameBean } from "../bean/getOneGameBean.type.ts";
import type { SetGameFinishedBean } from "../bean/setGameFinishedBean.type.ts";
import type { UpdateGameBean } from "../bean/updateGameBean.type.ts";
import { fromGameEntityListToGameSummaryBeanList } from "../mapper/beanEntity/game/fromGameEntityListToGameSummaryBeanList.ts";
import { fromGameEntityToGameBean } from "../mapper/beanEntity/game/fromGameEntityToGameBean.ts";
import { fromGameEntityToGameSummaryBean } from "../mapper/beanEntity/game/fromGameEntityToGameSummaryBean.ts";
import { getBossesDeathDateRangeQuery } from "../query/boss/getBossesDeathDateRangeQuery.ts";
import { createGameQuery } from "../query/game/createGameQuery.ts";
import { deleteGameQuery } from "../query/game/deleteGameQuery.ts";
import { getAllGamesQuery } from "../query/game/getAllGamesQuery.ts";
import { getGamesTotalDeathQuery } from "../query/game/getGamesTotalDeathQuery.ts";
import { getGameWithBossesByIdQuery } from "../query/game/getGameWithBossesByIdQuery.ts";
import { updateGameEndedAtQuery } from "../query/game/updateGameEndedAtQuery.ts";
import { updateGameQuery } from "../query/game/updateGameQuery.ts";

class GameService {
	async getAllGames(): Promise<GameSummaryBean[]> {
		const gameEntities = await getAllGamesQuery();

		const gameIds = gameEntities.map((game) => game.id);
		const gamesTotalDeath = await getGamesTotalDeathQuery(gameIds);

		const totalDeathByGameId = new Map(
			gamesTotalDeath.map((row) => [row.gameId, row.totalDeath]),
		);

		return fromGameEntityListToGameSummaryBeanList(
			gameEntities,
			totalDeathByGameId,
		);
	}

	async getOneGame(getOneGameBean: GetOneGameBean): Promise<GameBean> {
		const gameEntity = await getGameWithBossesByIdQuery(getOneGameBean.id);
		if (gameEntity === null)
			throw new NotFoundError(
				GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${getOneGameBean.id}`,
			);

		const bossIds = gameEntity.bosses.map((boss) => boss.id);
		const deathDateRanges = await getBossesDeathDateRangeQuery(bossIds);

		const deathDateRangeByBossId = new Map(
			deathDateRanges.map((row) => [row.bossId, row]),
		);

		return fromGameEntityToGameBean(gameEntity, deathDateRangeByBossId);
	}

	async createGame(createGameBean: CreateGameBean): Promise<GameSummaryBean> {
		const gameEntity = await createGameQuery(createGameBean);
		return fromGameEntityToGameSummaryBean(gameEntity, 0);
	}

	async updateGame(updateGameBean: UpdateGameBean): Promise<GameSummaryBean> {
		const gameEntity = await updateGameQuery(updateGameBean);
		if (gameEntity === null)
			throw new NotFoundError(
				GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${updateGameBean.id}`,
			);

		const gamesTotalDeath = await getGamesTotalDeathQuery([gameEntity.id]);

		const gameTotalDeath = gamesTotalDeath.at(0)?.totalDeath ?? 0;

		return fromGameEntityToGameSummaryBean(gameEntity, gameTotalDeath);
	}

	async setGameFinished(
		setGameFinishedBean: SetGameFinishedBean,
	): Promise<GameSummaryBean> {
		const endedAt = setGameFinishedBean.finished ? dateNow() : null;

		const gameEntity = await updateGameEndedAtQuery(
			setGameFinishedBean.id,
			endedAt,
		);
		if (gameEntity === null)
			throw new NotFoundError(
				GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${setGameFinishedBean.id}`,
			);

		const gamesTotalDeath = await getGamesTotalDeathQuery([gameEntity.id]);
		const gameTotalDeath = gamesTotalDeath.at(0)?.totalDeath ?? 0;

		return fromGameEntityToGameSummaryBean(gameEntity, gameTotalDeath);
	}

	async deleteGame(deleteGameBean: DeleteGameBean): Promise<void> {
		const wasDeleted = await deleteGameQuery(deleteGameBean.id);
		if (!wasDeleted)
			throw new NotFoundError(
				GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${deleteGameBean.id}`,
			);
	}
}

export const gameService = new GameService();

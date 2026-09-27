import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { CreateGameBean } from "../bean/createGame.bean.ts";
import type { DeleteGameBean } from "../bean/deleteGame.bean.ts";
import type { GameBean } from "../bean/game.bean.ts";
import type { GameSummaryBean } from "../bean/gameSummary.bean.ts";
import type { GetOneGameBean } from "../bean/getOneGame.bean.ts";
import { fromGameEntityListToGameSummaryBeanList } from "../mapper/beanEntity/game/fromGameEntityListToGameSummaryBeanList.ts";
import { fromGameEntityToGameBean } from "../mapper/beanEntity/game/fromGameEntityToGameBean.ts";
import { fromGameEntityToGameSummaryBean } from "../mapper/beanEntity/game/fromGameEntityToGameSummaryBean.ts";
import { createGameQuery } from "../query/game/createGame.query.ts";
import { deleteGameQuery } from "../query/game/deleteGame.query.ts";
import { getAllGamesQuery } from "../query/game/getAllGames.query.ts";
import { getBossesDeathDateRangeQuery } from "../query/game/getBossesDeathDateRange.query.ts";
import { getGameWithBossesByIdQuery } from "../query/game/getGameWithBossesById.query.ts";

export class GameService {
	async getAllGames(): Promise<GameSummaryBean[]> {
		return fromGameEntityListToGameSummaryBeanList(await getAllGamesQuery());
	}

	async getOneGame(getOneGameBean: GetOneGameBean): Promise<GameBean> {
		const gameEntity = await getGameWithBossesByIdQuery(getOneGameBean.id);
		if (gameEntity === null)
			throw new NotFoundError(`No game with id : ${getOneGameBean.id}`);

		const bossIds = (gameEntity.bosses ?? []).map((boss) => boss.id);
		const deathDateRanges = await getBossesDeathDateRangeQuery(bossIds);

		const deathDateRangeByBossId = new Map(
			deathDateRanges.map((row) => [row.bossId, row]),
		);

		return fromGameEntityToGameBean(gameEntity, deathDateRangeByBossId);
	}

	async createGame(createGameBean: CreateGameBean): Promise<GameSummaryBean> {
		const gameEntity = await createGameQuery(createGameBean);
		return fromGameEntityToGameSummaryBean(gameEntity);
	}

	async deleteGame(deleteGameBean: DeleteGameBean): Promise<void> {
		const wasDeleted = await deleteGameQuery(deleteGameBean.id);
		if (!wasDeleted)
			throw new NotFoundError(`No game with id : ${deleteGameBean.id}`);
	}
}

export const gameService = new GameService();

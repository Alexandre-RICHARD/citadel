import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { CreateGameBean } from "../bean/createGameBean.ts";
import type { DeleteGameBean } from "../bean/deleteGameBean.ts";
import type { GameSummaryBean } from "../bean/gameSummaryBean.ts";
import { gameMapper } from "../mapper/game.mapper.ts";
import { createGameQuery } from "../query/game/createGame.query.ts";
import { deleteGameQuery } from "../query/game/deleteGame.query.ts";
import { getAllGamesQuery } from "../query/game/getAllGamesQuery.ts";
import { getGameByIdQuery } from "../query/game/getGameById.query.ts";

export class GameService {
	async getGameById(id: number): Promise<GameSummaryBean | null> {
		const gameEntity = await getGameByIdQuery(id);
		if (gameEntity === null) return null;
		return gameMapper.fromGameEntityToGameSummaryBean(gameEntity);
	}

	async getAllGames(): Promise<GameSummaryBean[]> {
		return gameMapper.fromGameEntityListToGameSummaryBeanList(
			await getAllGamesQuery(),
		);
	}

	async createGame(createGameBean: CreateGameBean): Promise<GameSummaryBean> {
		const gameEntity = await createGameQuery(createGameBean);
		return gameMapper.fromGameEntityToGameSummaryBean(gameEntity);
	}

	async deleteGame(deleteGameBean: DeleteGameBean): Promise<void> {
		const wasDeleted = await deleteGameQuery(deleteGameBean.id);
		if (!wasDeleted)
			throw new NotFoundError(`No game with id : ${deleteGameBean.id}`);
	}
}

export const gameService = new GameService();

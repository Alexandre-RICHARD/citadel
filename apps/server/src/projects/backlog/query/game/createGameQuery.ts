import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { GameImportBean } from "../../bean/gameImportBean.type.ts";
import { Game } from "../../models/Game.ts";

type NewGame = Omit<GameImportBean["game"], "igdbUrl"> & {
	proposedSeriesId: number | null;
	developerId: number | null;
	publisherId: number | null;
};

export async function createGameQuery(
	game: NewGame,
	transaction: Transaction,
): Promise<void> {
	try {
		await Game.create(
			{
				id: game.id,
				name: game.name,
				frenchName: game.frenchName,
				firstReleaseDate: game.firstReleaseDate,
				isCancelled: game.isCancelled,
				proposedSeriesId: game.proposedSeriesId,
				developerId: game.developerId,
				publisherId: game.publisherId,
			},
			{ transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to insert new game", { cause: error });
	}
}

import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

// Le jeu est dans le backlog d'au moins un compte, quel qu'il soit
export async function isGameInAnyBacklogQuery(
	gameId: number,
	transaction: Transaction,
): Promise<boolean> {
	try {
		return (await UserGame.count({ where: { gameId }, transaction })) > 0;
	} catch (error) {
		throw new DatabaseError("Failed to check game in backlogs", {
			cause: error,
		});
	}
}

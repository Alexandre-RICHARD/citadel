import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

// Le jeu quitte le backlog avec sa personnalisation ; il reste en base
export async function deleteUserGameQuery(
	gameId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await UserGame.destroy({ where: { gameId }, transaction });
	} catch (error) {
		throw new DatabaseError("Failed to delete backlog game", { cause: error });
	}
}

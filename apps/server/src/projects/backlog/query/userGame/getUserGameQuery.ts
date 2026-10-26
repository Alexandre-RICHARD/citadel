import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

// Verrouillé jusqu'à la fin de la transaction : une autre modification du même jeu attend son tour
export async function getUserGameQuery(
	gameId: number,
	transaction: Transaction,
): Promise<UserGame | null> {
	try {
		return await UserGame.findByPk(gameId, {
			transaction,
			lock: transaction.LOCK.UPDATE,
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch backlog game", { cause: error });
	}
}

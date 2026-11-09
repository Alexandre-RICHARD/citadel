import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

/**
 * Verrouille la ligne du jeu jusqu'à la fin de la transaction et dit s'il existe. Un ajout au backlog en même temps
 * (qui lit cette ligne par sa clé étrangère) attend alors la suppression, au lieu de passer entre la vérification et
 * le DELETE
 */
export async function lockGameQuery(
	gameId: number,
	transaction: Transaction,
): Promise<boolean> {
	try {
		const game = await Game.findByPk(gameId, {
			attributes: ["id"],
			lock: transaction.LOCK.UPDATE,
			transaction,
		});
		return game !== null;
	} catch (error) {
		throw new DatabaseError("Failed to lock game", { cause: error });
	}
}

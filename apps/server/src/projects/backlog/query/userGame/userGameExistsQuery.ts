import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

/**
 * Lecture sans verrou : verrouiller une ligne absente pose un verrou d'intervalle, et deux ajouts du même jeu en même
 * temps s'interbloqueraient à l'insertion. Le second ajout bute alors sur la clé primaire (createUserGameQuery)
 */
export async function userGameExistsQuery(
	userId: number,
	gameId: number,
	transaction: Transaction,
): Promise<boolean> {
	try {
		const userGame = await UserGame.findOne({
			attributes: ["gameId"],
			where: { userId, gameId },
			transaction,
		});
		return userGame !== null;
	} catch (error) {
		throw new DatabaseError("Failed to check backlog game", { cause: error });
	}
}

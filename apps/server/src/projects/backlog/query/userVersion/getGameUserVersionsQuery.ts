import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserVersion } from "../../models/UserVersion.ts";
import { Version } from "../../models/Version.ts";

// Versions jouées d'un jeu, verrouillées jusqu'à la fin de la transaction
export async function getGameUserVersionsQuery(
	gameId: number,
	transaction: Transaction,
): Promise<UserVersion[]> {
	try {
		return await UserVersion.findAll({
			include: [
				{
					model: Version,
					as: "version",
					required: true,
					where: { gameId },
					attributes: [],
				},
			],
			order: [["id", "ASC"]],
			transaction,
			lock: transaction.LOCK.UPDATE,
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch played versions of game", {
			cause: error,
		});
	}
}

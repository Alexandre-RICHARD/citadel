import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Dlc } from "../../models/Dlc.ts";

// DLC de ces jeux, par id ; null : de tous les jeux
export async function getDlcsOfGamesQuery(
	gameIds: number[] | null,
	transaction: Transaction | null = null,
): Promise<Dlc[]> {
	if (gameIds?.length === 0) return [];

	try {
		return await Dlc.findAll({
			where: gameIds === null ? {} : { gameId: gameIds },
			order: [["id", "ASC"]],
			transaction,
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch DLCs", { cause: error });
	}
}

import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Dlc } from "../../models/Dlc.ts";

export async function dlcBelongsToGameQuery(
	dlcId: number,
	gameId: number,
	transaction: Transaction,
): Promise<boolean> {
	try {
		return (await Dlc.count({ where: { id: dlcId, gameId }, transaction })) > 0;
	} catch (error) {
		throw new DatabaseError("Failed to check DLC existence", { cause: error });
	}
}

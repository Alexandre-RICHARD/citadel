import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

export async function gameExistsQuery(
	gameId: number,
	transaction: Transaction | null = null,
): Promise<boolean> {
	try {
		return (await Game.count({ where: { id: gameId }, transaction })) > 0;
	} catch (error) {
		throw new DatabaseError("Failed to check game existence", { cause: error });
	}
}

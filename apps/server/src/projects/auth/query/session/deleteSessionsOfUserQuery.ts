import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Session } from "../../models/Session.ts";

// Toutes les sessions du compte, sur tous les appareils
export async function deleteSessionsOfUserQuery(
	userId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await Session.destroy({ where: { userId }, transaction });
	} catch (error) {
		throw new DatabaseError("Failed to delete the sessions of the user", {
			cause: error,
		});
	}
}

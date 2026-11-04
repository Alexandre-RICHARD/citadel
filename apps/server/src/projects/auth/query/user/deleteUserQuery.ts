import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

// Le compte, et par cascade tout ce que la base lui rattache : sessions, parcours, facteurs, codes de secours, journal
export async function deleteUserQuery(
	userId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await User.destroy({ where: { id: userId }, transaction });
	} catch (error) {
		throw new DatabaseError("Failed to delete user", { cause: error });
	}
}

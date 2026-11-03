import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

/**
 * Verrouille la ligne du compte jusqu'à la fin de la transaction : les changements de sa double authentification
 * (premier facteur et ses codes de secours, dernier facteur retiré) passent l'un après l'autre, jamais mêlés.
 * false : le compte n'existe plus
 */
export async function lockUserQuery(
	userId: number,
	transaction: Transaction,
): Promise<boolean> {
	try {
		const user = await User.findByPk(userId, {
			attributes: ["id"],
			lock: transaction.LOCK.UPDATE,
			transaction,
		});
		return user !== null;
	} catch (error) {
		throw new DatabaseError("Failed to lock user", { cause: error });
	}
}

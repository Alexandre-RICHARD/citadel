import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

/**
 * Verrou partagé sur la ligne du compte jusqu'à la fin de la transaction : la suppression du compte (verrou exclusif)
 * attend, mais pas les écritures des projets, dont les clés étrangères vers auth_user prennent elles aussi un verrou
 * partagé. Exclusif, il ferait s'interbloquer ces écritures avec la transaction qui le tient. false : le compte
 * n'existe plus
 */
export async function shareLockUserQuery(
	userId: number,
	transaction: Transaction,
): Promise<boolean> {
	try {
		const user = await User.findByPk(userId, {
			attributes: ["id"],
			lock: transaction.LOCK.SHARE,
			transaction,
		});
		return user !== null;
	} catch (error) {
		throw new DatabaseError("Failed to lock user", { cause: error });
	}
}

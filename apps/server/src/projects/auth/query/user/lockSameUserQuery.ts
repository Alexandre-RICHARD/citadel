import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

/**
 * Verrouille le compte s'il est bien celui-là : même identifiant ET même pseudo (définitif, unique). Après une
 * restauration, un identifiant peut appartenir à un autre compte que dans le journal. false : aucun compte ne répond aux
 * deux
 */
export async function lockSameUserQuery(
	{ userId, username }: { userId: number; username: string },
	transaction: Transaction,
): Promise<boolean> {
	try {
		const user = await User.findOne({
			attributes: ["id"],
			where: { id: userId, username },
			lock: transaction.LOCK.UPDATE,
			transaction,
		});
		return user !== null;
	} catch (error) {
		throw new DatabaseError("Failed to lock user", { cause: error });
	}
}

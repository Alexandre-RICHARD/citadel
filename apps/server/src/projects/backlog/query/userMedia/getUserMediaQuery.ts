import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserMedia } from "../../models/UserMedia.ts";

/**
 * Un média du backlog du compte ; celui d'un autre compte répond comme absent. Avec `transaction`, sa ligne est
 * verrouillée jusqu'à la fin
 */
export async function getUserMediaQuery(
	userId: number,
	userMediaId: number,
	transaction: Transaction | null = null,
): Promise<UserMedia | null> {
	try {
		return await UserMedia.findOne({
			where: { id: userMediaId, userId },
			transaction,
			...(transaction !== null && { lock: transaction.LOCK.UPDATE }),
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch backlog media", { cause: error });
	}
}

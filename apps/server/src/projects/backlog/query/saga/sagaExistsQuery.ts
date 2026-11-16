import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Saga } from "../../models/Saga.ts";

// Une saga du compte ; celle d'un autre compte répond comme absente
export async function sagaExistsQuery(
	userId: number,
	sagaId: number,
	transaction: Transaction,
): Promise<boolean> {
	try {
		return (
			(await Saga.count({ where: { id: sagaId, userId }, transaction })) > 0
		);
	} catch (error) {
		throw new DatabaseError("Failed to check saga", { cause: error });
	}
}

import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Saga } from "../../models/Saga.ts";

/**
 * « Nouvelle saga… » : un nom déjà pris parmi les sagas du compte désigne la saga existante. La collation de la colonne
 * compare sans accents ni majuscules, et ignore les espaces de fin ; sinon, la saga est créée
 */
export async function findOrCreateSagaByNameQuery(
	userId: number,
	name: string,
	transaction: Transaction,
): Promise<number> {
	try {
		const existing = await Saga.findOne({
			where: { userId, name },
			transaction,
		});
		if (existing !== null) return existing.id;
		const created = await Saga.create({ userId, name }, { transaction });
		return created.id;
	} catch (error) {
		throw new DatabaseError("Failed to find or create saga", { cause: error });
	}
}

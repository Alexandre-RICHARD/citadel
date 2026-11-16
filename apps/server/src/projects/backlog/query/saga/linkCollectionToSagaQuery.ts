import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { SagaCollection } from "../../models/SagaCollection.ts";

// Relie une collection TMDB à une saga du compte, si elle ne l'est encore à aucune : un lien existant ne bouge pas
export async function linkCollectionToSagaQuery(
	userId: number,
	collectionId: number,
	sagaId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await SagaCollection.bulkCreate([{ userId, collectionId, sagaId }], {
			ignoreDuplicates: true,
			transaction,
		});
	} catch (error) {
		throw new DatabaseError("Failed to link collection to saga", {
			cause: error,
		});
	}
}

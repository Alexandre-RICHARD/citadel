import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { SagaBean } from "../../bean/sagaBean.type.ts";
import { Saga } from "../../models/Saga.ts";
import { SagaCollection } from "../../models/SagaCollection.ts";

// La saga du compte reliée à cette collection TMDB, s'il y en a une
export async function findSagaByCollectionQuery(
	userId: number,
	collectionId: number,
	transaction: Transaction | null = null,
): Promise<SagaBean | null> {
	try {
		const link = await SagaCollection.findOne({
			where: { userId, collectionId },
			transaction,
		});
		if (link === null) return null;
		const saga = await Saga.findOne({
			attributes: ["id", "name"],
			where: { id: link.sagaId, userId },
			transaction,
		});
		return saga === null ? null : { id: saga.id, name: saga.name };
	} catch (error) {
		throw new DatabaseError("Failed to fetch saga of collection", {
			cause: error,
		});
	}
}

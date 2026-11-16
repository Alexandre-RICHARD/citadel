import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/seriesEntry.type.ts";
import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserMedia } from "../../models/UserMedia.ts";

/**
 * Numéros des médias du backlog du compte dans une saga, au format des séries des jeux : les règles de numérotation sont
 * les mêmes (specs, helper/seriesNumber), et `gameId` y porte l'id de la ligne du média. Leurs lignes sont verrouillées
 * jusqu'à la fin de la transaction : deux placements simultanés ne donnent jamais deux fois le même numéro
 */
export async function getSagaNumbersQuery(
	userId: number,
	sagaId: number,
	transaction: Transaction,
): Promise<SeriesEntry[]> {
	try {
		const rows = await UserMedia.findAll({
			attributes: ["id", "sagaNumber"],
			where: { userId, sagaId },
			order: [["sagaNumber", "ASC"]],
			transaction,
			lock: transaction.LOCK.UPDATE,
		});
		return rows.flatMap(({ id, sagaNumber }) =>
			sagaNumber === null ? [] : [{ gameId: id, seriesNumber: sagaNumber }],
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch saga numbers", { cause: error });
	}
}

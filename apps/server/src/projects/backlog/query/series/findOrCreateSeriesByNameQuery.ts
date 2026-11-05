import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Series } from "../../models/Series.ts";
import { visibleSeries } from "./visibleSeries.ts";

/**
 * « Nouvelle série… » : un nom déjà pris parmi les séries du compte (les siennes et celles d'IGDB) désigne la série
 * existante. La collation de la colonne compare sans accents ni majuscules, et ignore les espaces de fin ; sinon, la
 * série est créée, à ce seul compte
 */
export async function findOrCreateSeriesByNameQuery(
	userId: number,
	name: string,
	transaction: Transaction,
): Promise<number> {
	try {
		const existing = await Series.findOne({
			where: { name, ...visibleSeries(userId) },
			order: [["id", "ASC"]],
			transaction,
		});
		if (existing !== null) return existing.id;

		const created = await Series.create(
			{ userId, name, igdbCollectionId: null, igdbFranchiseId: null },
			{ transaction },
		);
		return created.id;
	} catch (error) {
		throw new DatabaseError("Failed to find or create series", {
			cause: error,
		});
	}
}

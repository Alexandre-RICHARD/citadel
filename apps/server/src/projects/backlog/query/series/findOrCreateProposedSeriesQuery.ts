import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { ProposedSeriesBean } from "../../bean/proposedSeriesBean.type.ts";
import { Series } from "../../models/Series.ts";

// La série proposée par IGDB, déjà en base si un autre jeu l'a apportée (même collection, ou même franchise)
export async function findOrCreateProposedSeriesQuery(
	proposedSeries: ProposedSeriesBean,
	transaction: Transaction,
): Promise<number> {
	try {
		const existing = await Series.findOne({
			where:
				proposedSeries.igdbCollectionId === null
					? { igdbFranchiseId: proposedSeries.igdbFranchiseId }
					: { igdbCollectionId: proposedSeries.igdbCollectionId },
			transaction,
		});
		if (existing !== null) return existing.id;

		const created = await Series.create(
			{
				name: proposedSeries.name,
				igdbCollectionId: proposedSeries.igdbCollectionId,
				igdbFranchiseId: proposedSeries.igdbFranchiseId,
			},
			{ transaction },
		);
		return created.id;
	} catch (error) {
		throw new DatabaseError("Failed to find or create proposed series", {
			cause: error,
		});
	}
}

import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/seriesEntry.type.ts";
import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

// Nouveaux numéros de jeux du backlog d'une même série (décalage, réorganisation)
export async function updateSeriesNumbersQuery(
	entries: SeriesEntry[],
	transaction: Transaction,
): Promise<void> {
	try {
		await Promise.all(
			entries.map(({ gameId, seriesNumber }) =>
				UserGame.update({ seriesNumber }, { where: { gameId }, transaction }),
			),
		);
	} catch (error) {
		throw new DatabaseError("Failed to update series numbers", {
			cause: error,
		});
	}
}

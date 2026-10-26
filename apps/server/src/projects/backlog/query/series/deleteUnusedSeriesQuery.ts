import type { Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

/**
 * Une série qu'aucun jeu ne propose et qu'aucun jeu du backlog n'a choisie quitte la base :
 * une série créée à la main part avec son dernier jeu
 */
export async function deleteUnusedSeriesQuery(
	transaction: Transaction,
): Promise<void> {
	try {
		await sequelize.query(
			`
				DELETE FROM backlog_series
				WHERE NOT EXISTS (
					SELECT 1 FROM backlog_game g WHERE g.proposed_series_id = backlog_series.id
				)
				AND NOT EXISTS (
					SELECT 1 FROM backlog_user_game ug WHERE ug.series_id = backlog_series.id
				)
			`,
			{ transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to delete unused series", {
			cause: error,
		});
	}
}

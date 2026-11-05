import type { Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

/**
 * Une série du compte créée à la main, qu'aucun jeu ne propose et qu'aucun jeu de son backlog n'a choisie, quitte la
 * base : elle part avec son dernier jeu. Seules les séries du compte sont lues (index de user_id) : la suppression ne
 * verrouille ni les séries des autres comptes ni les séries IGDB communes, qu'un jeu en base propose toujours
 */
export async function deleteUnusedSeriesQuery(
	userId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await sequelize.query(
			`
				DELETE FROM backlog_series
				WHERE user_id = :userId
				AND NOT EXISTS (
					SELECT 1 FROM backlog_game g WHERE g.proposed_series_id = backlog_series.id
				)
				AND NOT EXISTS (
					SELECT 1 FROM backlog_user_game ug WHERE ug.series_id = backlog_series.id
				)
			`,
			{ replacements: { userId }, transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to delete unused series", {
			cause: error,
		});
	}
}

import type { Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

// Les épisodes vus d'une série, quand elle quitte le backlog du compte
export async function deleteShowWatchedEpisodesQuery(
	userId: number,
	tvShowId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await sequelize.query(
			`
				DELETE we FROM backlog_watched_episode we
				JOIN backlog_tv_episode e ON e.id = we.tv_episode_id
				JOIN backlog_tv_season s ON s.id = e.tv_season_id
				WHERE we.user_id = :userId AND s.tv_show_id = :tvShowId
			`,
			{ replacements: { userId, tvShowId }, transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to delete watched episodes", {
			cause: error,
		});
	}
}

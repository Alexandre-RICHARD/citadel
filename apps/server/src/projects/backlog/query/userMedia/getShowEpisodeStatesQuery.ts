import type { ShowEpisodeState } from "@citadel/specs/src/projects/backlog/helper/media/showEpisodeState.type.ts";
import { QueryTypes, type Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

type EpisodeStateRow = {
	seasonNumber: number;
	airDate: string | null;
	runtimeMinutes: number | null;
	isWatched: number;
};

// Chaque épisode d'une série, et s'il est vu par le compte : de quoi calculer sa progression
export async function getShowEpisodeStatesQuery(
	userId: number,
	tvShowId: number,
	transaction: Transaction | null = null,
): Promise<ShowEpisodeState[]> {
	try {
		const rows = await sequelize.query<EpisodeStateRow>(
			`
				SELECT s.season_number AS seasonNumber,
					DATE_FORMAT(e.air_date, '%Y-%m-%d') AS airDate,
					e.runtime_minutes AS runtimeMinutes,
					we.user_id IS NOT NULL AS isWatched
				FROM backlog_tv_episode e
				JOIN backlog_tv_season s ON s.id = e.tv_season_id
				LEFT JOIN backlog_watched_episode we ON we.tv_episode_id = e.id AND we.user_id = :userId
				WHERE s.tv_show_id = :tvShowId
			`,
			{
				type: QueryTypes.SELECT,
				replacements: { userId, tvShowId },
				transaction,
			},
		);
		return rows.map((row) => ({ ...row, isWatched: Boolean(row.isWatched) }));
	} catch (error) {
		throw new DatabaseError("Failed to fetch show episodes", { cause: error });
	}
}

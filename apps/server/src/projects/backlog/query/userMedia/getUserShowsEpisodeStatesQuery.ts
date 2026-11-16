import type { ShowEpisodeState } from "@citadel/specs/src/projects/backlog/helper/media/showEpisodeState.type.ts";
import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

type EpisodeStateRow = {
	tvShowId: number;
	seasonNumber: number;
	airDate: string | null;
	runtimeMinutes: number | null;
	isWatched: number;
};

/**
 * Chaque épisode de chaque série du backlog du compte, et s'il est vu, rangé par série : la progression de toutes ses
 * séries en une seule lecture, pour le tableau
 */
export async function getUserShowsEpisodeStatesQuery(
	userId: number,
): Promise<Map<number, ShowEpisodeState[]>> {
	try {
		const rows = await sequelize.query<EpisodeStateRow>(
			`
				SELECT s.tv_show_id AS tvShowId,
					s.season_number AS seasonNumber,
					DATE_FORMAT(e.air_date, '%Y-%m-%d') AS airDate,
					e.runtime_minutes AS runtimeMinutes,
					we.user_id IS NOT NULL AS isWatched
				FROM backlog_user_media um
				JOIN backlog_tv_season s ON s.tv_show_id = um.tv_show_id
				JOIN backlog_tv_episode e ON e.tv_season_id = s.id
				LEFT JOIN backlog_watched_episode we ON we.tv_episode_id = e.id AND we.user_id = :userId
				WHERE um.user_id = :userId
			`,
			{ type: QueryTypes.SELECT, replacements: { userId } },
		);
		const statesByShow = new Map<number, ShowEpisodeState[]>();
		for (const { tvShowId, isWatched, ...state } of rows) {
			const states = statesByShow.get(tvShowId) ?? [];
			states.push({ ...state, isWatched: Boolean(isWatched) });
			statesByShow.set(tvShowId, states);
		}
		return statesByShow;
	} catch (error) {
		throw new DatabaseError("Failed to fetch show episodes", { cause: error });
	}
}

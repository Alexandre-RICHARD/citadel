import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { EpisodeRefBean } from "../../bean/episodeRefBean.type.ts";

type EpisodeRefRow = EpisodeRefBean & { tvShowId: number };

/**
 * Les épisodes de chaque série du backlog du compte, avec leurs numéros, rangés par série (son identifiant TMDB) : de
 * quoi relier toutes les séries du tableau au relevé du NAS en une seule lecture
 */
export async function getUserShowsEpisodeRefsQuery(
	userId: number,
): Promise<Map<number, EpisodeRefBean[]>> {
	try {
		const rows = await sequelize.query<EpisodeRefRow>(
			`
				SELECT s.tv_show_id AS tvShowId,
					e.id AS id,
					s.season_number AS seasonNumber,
					e.episode_number AS episodeNumber,
					DATE_FORMAT(e.air_date, '%Y-%m-%d') AS airDate,
					e.runtime_minutes AS runtimeMinutes
				FROM backlog_user_media um
				JOIN backlog_tv_season s ON s.tv_show_id = um.tv_show_id
				JOIN backlog_tv_episode e ON e.tv_season_id = s.id
				WHERE um.user_id = :userId
			`,
			{ type: QueryTypes.SELECT, replacements: { userId } },
		);
		const refsByShow = new Map<number, EpisodeRefBean[]>();
		for (const { tvShowId, ...ref } of rows)
			refsByShow.set(tvShowId, [...(refsByShow.get(tvShowId) ?? []), ref]);
		return refsByShow;
	} catch (error) {
		throw new DatabaseError("Failed to fetch show episode numbers", {
			cause: error,
		});
	}
}

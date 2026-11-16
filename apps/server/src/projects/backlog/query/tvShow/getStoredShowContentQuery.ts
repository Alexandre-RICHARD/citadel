import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

type ContentRow = {
	seasonId: number;
	episodeId: number | null;
};

// Les saisons et les épisodes d'une série déjà en base, pour compter ce que TMDB apporte de nouveau
export async function getStoredShowContentQuery(
	tvShowId: number,
): Promise<{ seasonIds: Set<number>; episodeIds: Set<number> }> {
	try {
		const rows = await sequelize.query<ContentRow>(
			`
				SELECT s.id AS seasonId, e.id AS episodeId
				FROM backlog_tv_season s
				LEFT JOIN backlog_tv_episode e ON e.tv_season_id = s.id
				WHERE s.tv_show_id = :tvShowId
			`,
			{ type: QueryTypes.SELECT, replacements: { tvShowId } },
		);
		return {
			seasonIds: new Set(rows.map(({ seasonId }) => seasonId)),
			episodeIds: new Set(
				rows.flatMap(({ episodeId }) =>
					episodeId === null ? [] : [episodeId],
				),
			),
		};
	} catch (error) {
		throw new DatabaseError("Failed to fetch show content", { cause: error });
	}
}

import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

type Row = { mediaType: string; tmdbId: number };

// Les médias du backlog du compte dont TMDB ne connaît plus l'identifiant, en clés « movie:603 », « show:1396 »
export async function getGoneTmdbIdsQuery(
	userId: number,
): Promise<Set<string>> {
	try {
		const rows = await sequelize.query<Row>(
			`
				SELECT :movie AS mediaType, m.id AS tmdbId
				FROM backlog_movie m
				JOIN backlog_user_media um ON um.movie_id = m.id
				WHERE um.user_id = :userId AND m.tmdb_gone_at IS NOT NULL
				UNION ALL
				SELECT :show AS mediaType, s.id AS tmdbId
				FROM backlog_tv_show s
				JOIN backlog_user_media um ON um.tv_show_id = s.id
				WHERE um.user_id = :userId AND s.tmdb_gone_at IS NOT NULL
			`,
			{
				type: QueryTypes.SELECT,
				replacements: {
					movie: MediaTypeEnum.MOVIE,
					show: MediaTypeEnum.SHOW,
					userId,
				},
			},
		);
		return new Set(
			rows.map(({ mediaType, tmdbId }) => `${mediaType}:${tmdbId}`),
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch the gone TMDB ids", {
			cause: error,
		});
	}
}

import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { TmdbIdRef } from "./tmdbIdRef.type.ts";

/**
 * Les `limit` films et séries des backlogs vérifiés le moins récemment sur TMDB, jamais vérifiés d'abord. Un média
 * qu'aucun backlog ne contient n'est plus vérifié
 */
export async function getTmdbIdsToCheckQuery(
	limit: number,
): Promise<TmdbIdRef[]> {
	try {
		const rows = await sequelize.query<TmdbIdRef>(
			`
				SELECT media_type AS mediaType, tmdb_id AS tmdbId
				FROM (
					SELECT DISTINCT :movie AS media_type, m.id AS tmdb_id, m.tmdb_checked_at AS checked_at
					FROM backlog_movie m
					JOIN backlog_user_media um ON um.movie_id = m.id
					UNION ALL
					SELECT DISTINCT :show AS media_type, s.id AS tmdb_id, s.tmdb_checked_at AS checked_at
					FROM backlog_tv_show s
					JOIN backlog_user_media um ON um.tv_show_id = s.id
				) media
				ORDER BY checked_at IS NOT NULL, checked_at, media_type, tmdb_id
				LIMIT :limit
			`,
			{
				type: QueryTypes.SELECT,
				replacements: {
					movie: MediaTypeEnum.MOVIE,
					show: MediaTypeEnum.SHOW,
					limit,
				},
			},
		);
		return rows;
	} catch (error) {
		throw new DatabaseError("Failed to fetch the TMDB ids to check", {
			cause: error,
		});
	}
}

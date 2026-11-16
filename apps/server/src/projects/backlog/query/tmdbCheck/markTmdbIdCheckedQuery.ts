import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { TmdbIdRef } from "./tmdbIdRef.type.ts";

/**
 * Note la vérification d'un identifiant : disparu, il garde la date de sa disparition ; revenu, il la perd. updated_at
 * recopié tel quel : une vérification ne modifie pas le média
 */
export async function markTmdbIdCheckedQuery(
	{ mediaType, tmdbId }: TmdbIdRef,
	isGone: boolean,
): Promise<void> {
	const table =
		mediaType === MediaTypeEnum.MOVIE ? "backlog_movie" : "backlog_tv_show";
	try {
		await sequelize.query(
			`
				UPDATE ${table}
				SET tmdb_checked_at = CURRENT_TIMESTAMP(3),
					tmdb_gone_at = CASE WHEN :isGone THEN COALESCE(tmdb_gone_at, CURRENT_TIMESTAMP(3)) ELSE NULL END,
					updated_at = updated_at
				WHERE id = :tmdbId
			`,
			{ type: QueryTypes.UPDATE, replacements: { isGone, tmdbId } },
		);
	} catch (error) {
		throw new DatabaseError("Failed to mark a TMDB id as checked", {
			cause: error,
		});
	}
}

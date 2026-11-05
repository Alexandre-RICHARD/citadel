import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { StoredVersionRow } from "../../dbType/storedVersionRow.type.ts";

// Parmi ces fiches IGDB, celles déjà en base comme version, avec leur jeu et s'il est dans le backlog du compte
export async function getStoredVersionsQuery(
	userId: number,
	igdbIds: number[],
): Promise<StoredVersionRow[]> {
	if (igdbIds.length === 0) return [];

	try {
		return await sequelize.query<StoredVersionRow>(
			`
				SELECT
					v.id,
					v.game_id AS gameId,
					ug.game_id IS NOT NULL AS isInBacklog
				FROM backlog_version v
				LEFT JOIN backlog_user_game ug ON ug.user_id = :userId AND ug.game_id = v.game_id
				WHERE v.id IN (:igdbIds)
			`,
			{ replacements: { userId, igdbIds }, type: QueryTypes.SELECT },
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch stored versions", {
			cause: error,
		});
	}
}

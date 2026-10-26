import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { GamePlatformNameRow } from "../../dbType/gamePlatformNameRow.type.ts";

// Plateformes de toutes les versions de chaque jeu, une fois chacune, par nom
export async function getGamesPlatformNamesQuery(
	gameIds: number[],
): Promise<GamePlatformNameRow[]> {
	if (gameIds.length === 0) return [];

	try {
		return await sequelize.query<GamePlatformNameRow>(
			`
				SELECT DISTINCT v.game_id AS gameId, p.short_name AS shortName
				FROM backlog_version v
				JOIN backlog_version_platform vp ON vp.version_id = v.id
				JOIN backlog_platform p ON p.id = vp.platform_id
				WHERE v.game_id IN (:gameIds)
				ORDER BY v.game_id, p.short_name
			`,
			{ replacements: { gameIds }, type: QueryTypes.SELECT },
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch platforms of games", {
			cause: error,
		});
	}
}

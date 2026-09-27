import { QueryTypes } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { sequelize } from "../../../../sequelize.ts";
import type { GameTotalDeathRow } from "../../dbType/gameTotalDeath.entity.ts";

/**
 * Game.totalDeath n'est pas stocké : c'est la somme des Boss.totalDeath du jeu
 * @returns Les jeux sans aucun boss n'y figurent pas
 */
export async function getGamesTotalDeathQuery(
	gameIds: number[],
): Promise<GameTotalDeathRow[]> {
	if (gameIds.length === 0) return [];

	try {
		return await sequelize.query<GameTotalDeathRow>(
			`
				SELECT
					game_id AS gameId,
					SUM(total_death) AS totalDeath
				FROM boss
				WHERE game_id IN (:gameIds)
				GROUP BY game_id
			`,
			{
				replacements: { gameIds },
				type: QueryTypes.SELECT,
			},
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch total death for games", {
			cause: error,
		});
	}
}

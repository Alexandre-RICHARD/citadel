import { finishedStatuses } from "@citadel/specs/src/projects/backlog/helper/status/finishedStatuses.ts";
import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { CountRow } from "../../dbType/countRow.type.ts";

// Jeux du compte dont au moins une version jouée a un statut de fin : un jeu compte une fois, même fini sur deux plateformes
export async function countFinishedUserGamesQuery(
	userId: number,
): Promise<number> {
	try {
		const row = await sequelize.query<CountRow>(
			`
				SELECT COUNT(DISTINCT v.game_id) AS count
				FROM backlog_user_version uv
				JOIN backlog_version v ON v.id = uv.version_id
				WHERE uv.user_id = :userId AND uv.status IN (:finishedStatuses)
			`,
			{
				replacements: { userId, finishedStatuses: [...finishedStatuses] },
				type: QueryTypes.SELECT,
				plain: true,
			},
		);
		return Number(row?.count ?? 0);
	} catch (error) {
		throw new DatabaseError("Failed to count finished games", {
			cause: error,
		});
	}
}

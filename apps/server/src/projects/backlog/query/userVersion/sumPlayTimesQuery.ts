import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { PlayTimeTotalsBean } from "../../bean/playTimeTotalsBean.type.ts";
import type { PlayTimeTotalsRow } from "../../dbType/playTimeTotalsRow.type.ts";

// Temps de jeu de toutes les versions jouées du compte, relevé et estimé séparément
export async function sumPlayTimesQuery(
	userId: number,
): Promise<PlayTimeTotalsBean> {
	try {
		const row = await sequelize.query<PlayTimeTotalsRow>(
			`
				SELECT
					COALESCE(SUM(tracked_play_time_minutes), 0) AS trackedMinutes,
					COALESCE(SUM(estimated_play_time_minutes), 0) AS estimatedMinutes
				FROM backlog_user_version
				WHERE user_id = :userId
			`,
			{ replacements: { userId }, type: QueryTypes.SELECT, plain: true },
		);
		return {
			trackedMinutes: Number(row?.trackedMinutes ?? 0),
			estimatedMinutes: Number(row?.estimatedMinutes ?? 0),
		};
	} catch (error) {
		throw new DatabaseError("Failed to sum play times", { cause: error });
	}
}

import { QueryTypes } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { sequelize } from "../../../../sequelize.ts";
import type { BossDeathDateRangeRow } from "../../dbType/bossDeathDateRange.entity.ts";

export async function getBossesDeathDateRangeQuery(
	bossIds: number[],
): Promise<BossDeathDateRangeRow[]> {
	if (bossIds.length === 0) return [];

	try {
		const bossDeathDateRange = await sequelize.query<BossDeathDateRangeRow>(
			`
				SELECT
					boss_id AS bossId,
					MIN(date) AS firstDeathDate,
					MAX(date) AS lastDeathDate
				FROM death
				WHERE boss_id IN (:bossIds)
				GROUP BY boss_id
			`,
			{
				replacements: { bossIds },
				type: QueryTypes.SELECT,
			},
		);
		return bossDeathDateRange;
	} catch (error) {
		throw new DatabaseError("Failed to fetch death date range for bosses", {
			cause: error,
		});
	}
}

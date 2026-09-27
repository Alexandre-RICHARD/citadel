import { QueryTypes } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { sequelize } from "../../../../sequelize.ts";
import type { BossDeathDateRangeRow } from "../../dbType/bossDeathDateRange.entity.ts";

// TODO Point de vigilence ici. A revenir pour confirmer que ça fait ce qu'il faut
export async function getBossesDeathDateRangeQuery(
	bossIds: number[],
): Promise<BossDeathDateRangeRow[]> {
	if (bossIds.length === 0) return [];

	try {
		return await sequelize.query<BossDeathDateRangeRow>(
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
	} catch {
		throw new DatabaseError("Failed to fetch death date range for bosses");
	}
}

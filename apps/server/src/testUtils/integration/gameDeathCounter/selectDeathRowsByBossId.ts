import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import type { DeathRow } from "./deathRow.type.ts";

export async function selectDeathRowsByBossId(
	bossId: number,
): Promise<DeathRow[]> {
	return sequelize.query<DeathRow>(
		`SELECT id, boss_id AS bossId, date, comment, created_at AS createdAt, updated_at AS updatedAt
		FROM death
		WHERE boss_id = :bossId
		ORDER BY id`,
		{ type: QueryTypes.SELECT, replacements: { bossId } },
	);
}

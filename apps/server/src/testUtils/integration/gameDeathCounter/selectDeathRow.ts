import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import type { DeathRow } from "./deathRow.type.ts";

// Lecture en SQL brut : vérifie les vraies colonnes, indépendamment du mapping des modèles
export async function selectDeathRow(id: number): Promise<DeathRow | null> {
	return sequelize.query<DeathRow>(
		`SELECT id, boss_id AS bossId, date, comment, created_at AS createdAt, updated_at AS updatedAt
		FROM death
		WHERE id = :id`,
		{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
	);
}

import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import type { BossRow } from "./bossRow.type.ts";

// Lecture en SQL brut : vérifie les vraies colonnes, indépendamment du mapping des modèles
export async function selectBossRow(id: number): Promise<BossRow | null> {
	return sequelize.query<BossRow>(
		`SELECT id, game_id AS gameId, name, defeated_at AS defeatedAt, total_death AS totalDeath,
			created_at AS createdAt, updated_at AS updatedAt
		FROM boss
		WHERE id = :id`,
		{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
	);
}

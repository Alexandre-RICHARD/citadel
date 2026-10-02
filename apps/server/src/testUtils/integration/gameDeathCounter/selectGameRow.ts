import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import type { GameRow } from "./gameRow.type.ts";

// Lecture en SQL brut : vérifie les vraies colonnes, indépendamment du mapping des modèles
export async function selectGameRow(id: number): Promise<GameRow | null> {
	return sequelize.query<GameRow>(
		`SELECT id, name, ended_at AS endedAt, created_at AS createdAt, updated_at AS updatedAt
		FROM game
		WHERE id = :id`,
		{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
	);
}

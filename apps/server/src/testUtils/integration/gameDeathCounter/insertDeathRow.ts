import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

type InsertDeathRowParams = {
	bossId: number;
	date: Date;
	comment?: string | null;
};

/**
 * Insère directement en base, sans passer par l'API ni par les modèles : renvoie l'id créé.
 * Le compteur total_death du boss n'est pas touché : à fixer soi-même avec insertBossRow.
 */
export async function insertDeathRow({
	bossId,
	date,
	comment = null,
}: InsertDeathRowParams): Promise<number> {
	const [insertedId] = await sequelize.query(
		`INSERT INTO death (boss_id, date, comment)
		VALUES (:bossId, :date, :comment)`,
		{
			type: QueryTypes.INSERT,
			replacements: { bossId, date, comment },
		},
	);
	return insertedId;
}

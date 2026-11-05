import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

type InsertGameRowParams = {
	// Le compte propriétaire : ses boss et ses morts lui appartiennent aussi
	userId: number;
	name: string;
	endedAt?: Date | null;
	createdAt?: Date;
};

// Insère directement en base, sans passer par l'API ni par les modèles : renvoie l'id créé
export async function insertGameRow({
	userId,
	name,
	endedAt = null,
	createdAt = new Date(),
}: InsertGameRowParams): Promise<number> {
	const [insertedId] = await sequelize.query(
		`INSERT INTO gdc_game (user_id, name, ended_at, created_at, updated_at)
		VALUES (:userId, :name, :endedAt, :createdAt, :createdAt)`,
		{
			type: QueryTypes.INSERT,
			replacements: { userId, name, endedAt, createdAt },
		},
	);
	return insertedId;
}

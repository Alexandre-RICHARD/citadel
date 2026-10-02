import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

type InsertGameRowParams = {
	name: string;
	endedAt?: Date | null;
	createdAt?: Date;
};

// Insère directement en base, sans passer par l'API ni par les modèles : renvoie l'id créé
export async function insertGameRow({
	name,
	endedAt = null,
	createdAt = new Date(),
}: InsertGameRowParams): Promise<number> {
	const [insertedId] = await sequelize.query(
		`INSERT INTO game (name, ended_at, created_at, updated_at)
		VALUES (:name, :endedAt, :createdAt, :createdAt)`,
		{
			type: QueryTypes.INSERT,
			replacements: { name, endedAt, createdAt },
		},
	);
	return insertedId;
}

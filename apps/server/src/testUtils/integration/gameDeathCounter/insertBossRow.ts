import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

type InsertBossRowParams = {
	gameId: number;
	name: string;
	defeatedAt?: Date | null;
	// Compteur dénormalisé : il peut volontairement différer du nombre de lignes death
	totalDeath?: number;
	createdAt?: Date;
};

// Insère directement en base, sans passer par l'API ni par les modèles : renvoie l'id créé
export async function insertBossRow({
	gameId,
	name,
	defeatedAt = null,
	totalDeath = 0,
	createdAt = new Date(),
}: InsertBossRowParams): Promise<number> {
	const [insertedId] = await sequelize.query(
		`INSERT INTO boss (game_id, name, defeated_at, total_death, created_at, updated_at)
		VALUES (:gameId, :name, :defeatedAt, :totalDeath, :createdAt, :createdAt)`,
		{
			type: QueryTypes.INSERT,
			replacements: { gameId, name, defeatedAt, totalDeath, createdAt },
		},
	);
	return insertedId;
}

// Ligne de la table boss, lue en SQL brut (colonnes renommées en camelCase)
export type BossRow = {
	id: number;
	gameId: number;
	name: string;
	defeatedAt: Date | null;
	totalDeath: number;
	createdAt: Date;
	updatedAt: Date;
};

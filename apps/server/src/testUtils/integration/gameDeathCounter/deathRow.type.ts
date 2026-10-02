// Ligne de la table death, lue en SQL brut (colonnes renommées en camelCase)
export type DeathRow = {
	id: number;
	bossId: number;
	date: Date;
	comment: string | null;
	createdAt: Date;
	updatedAt: Date;
};

// Ligne de la table game, lue en SQL brut (colonnes renommées en camelCase)
export type GameRow = {
	id: number;
	name: string;
	endedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

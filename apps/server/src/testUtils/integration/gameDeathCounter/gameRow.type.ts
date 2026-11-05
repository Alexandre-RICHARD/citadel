// Ligne de la table gdc_game, lue en SQL brut (colonnes renommées en camelCase)
export type GameRow = {
	id: number;
	userId: number;
	name: string;
	endedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

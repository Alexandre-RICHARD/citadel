export type GameSummaryBean = {
	id: number;
	name: string;
	// La date de création du jeu (`created_at`) : le nom de l'API est resté, la colonne `started_at` a disparu (V006)
	startedAt: Date;
	endedAt: Date | null;
	totalDeath: number;
};

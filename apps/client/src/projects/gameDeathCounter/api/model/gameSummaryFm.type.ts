export type GameSummaryFm = {
	id: number;
	name: string;
	startedAt: string;
	endedAt: string | null;
	totalDeath: number;
	isFinished: boolean;
	// Créé de façon optimiste, pas encore confirmé par le serveur : grisé et inerte
	isTemporary: boolean;
};

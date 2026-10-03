export type BossSummaryFm = {
	id: number;
	name: string;
	// Première et dernière tentative (mort ou victoire), calculées par le serveur
	firstTry: string | null;
	lastTry: string | null;
	defeatedAt: string | null;
	totalDeath: number;
	isDefeated: boolean;
	isTemporary: boolean;
};

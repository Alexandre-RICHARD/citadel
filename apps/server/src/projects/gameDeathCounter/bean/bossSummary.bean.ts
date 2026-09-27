export type BossSummaryBean = {
	id: number;
	gameId: number;
	name: string;
	firstTry: Date | null;
	lastTry: Date | null;
	defeatedAt: Date | null;
	totalDeath: number;
};

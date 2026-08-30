export type BossSummaryDto = {
	id: number;
	gameId: number;
	name: string;
	firstTry: string;
	lastTry: string;
	defeatedAt: string | null;
	totalDeath: number;
};

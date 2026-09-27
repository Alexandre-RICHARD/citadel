export type BossSummaryDto = {
	id: number;
	gameId: number;
	name: string;
	firstTry: string | null;
	lastTry: string | null;
	defeatedAt: string | null;
	totalDeath: number;
};

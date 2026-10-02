export type GameSummaryDto = {
	id: number;
	name: string;
	startedAt: string;
	endedAt: string | null;
	totalDeath: number;
};

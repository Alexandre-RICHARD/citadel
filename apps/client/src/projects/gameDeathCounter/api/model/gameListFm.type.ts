import type { GameSummaryFm } from "./gameSummaryFm.type";

export type GameListFm = {
	// Triés par nom
	games: GameSummaryFm[];
	// Toutes les morts, tous jeux confondus
	totalDeath: number;
};

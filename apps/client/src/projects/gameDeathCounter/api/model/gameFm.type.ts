import type { BossSummaryFm } from "./bossSummaryFm.type";
import type { GameSummaryFm } from "./gameSummaryFm.type";

export type GameFm = GameSummaryFm & {
	// Dans l'ordre de création
	bosses: BossSummaryFm[];
};

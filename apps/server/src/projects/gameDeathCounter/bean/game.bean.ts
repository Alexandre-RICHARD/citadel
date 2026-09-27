import type { BossSummaryBean } from "./bossSummary.bean.ts";
import type { GameSummaryBean } from "./gameSummary.bean.ts";

export type GameBean = GameSummaryBean & {
	bosses: BossSummaryBean[];
};

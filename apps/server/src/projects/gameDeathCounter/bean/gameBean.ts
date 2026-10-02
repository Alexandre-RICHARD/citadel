import type { BossSummaryBean } from "./bossSummaryBean.ts";
import type { GameSummaryBean } from "./gameSummaryBean.ts";

export type GameBean = GameSummaryBean & {
	bosses: BossSummaryBean[];
};

import type { BossSummaryBean } from "./bossSummaryBean.type.ts";
import type { GameSummaryBean } from "./gameSummaryBean.type.ts";

export type GameBean = GameSummaryBean & {
	bosses: BossSummaryBean[];
};

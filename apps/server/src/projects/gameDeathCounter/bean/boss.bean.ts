import type { BossSummaryBean } from "./bossSummary.bean.ts";
import type { DeathBean } from "./death.bean.ts";

export type BossBean = BossSummaryBean & {
	deaths: DeathBean[];
};

import type { BossSummaryBean } from "./bossSummaryBean.ts";
import type { DeathBean } from "./deathBean.ts";

export type BossBean = BossSummaryBean & {
	deaths: DeathBean[];
};

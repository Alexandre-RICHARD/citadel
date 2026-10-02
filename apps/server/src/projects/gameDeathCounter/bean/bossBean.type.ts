import type { BossSummaryBean } from "./bossSummaryBean.type.ts";
import type { DeathBean } from "./deathBean.type.ts";

export type BossBean = BossSummaryBean & {
	deaths: DeathBean[];
};

import type { BossSummaryFm } from "./bossSummaryFm.type";
import type { DeathFm } from "./deathFm.type";

export type BossFm = BossSummaryFm & {
	// La plus récente en premier
	deaths: DeathFm[];
};

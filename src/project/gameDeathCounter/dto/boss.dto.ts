import type { BossSummaryDto } from "./bossSummary.dto.ts";
import type { DeathDto } from "./death.dto.ts";

export type BossDto = BossSummaryDto & {
	deaths: DeathDto[];
};

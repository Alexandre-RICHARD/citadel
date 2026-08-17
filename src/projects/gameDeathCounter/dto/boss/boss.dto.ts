import type { DeathDto } from "../death/death.dto.ts";
import type { BossSummaryDto } from "./bossSummary.dto.ts";

export type BossDto = BossSummaryDto & {
	deaths: DeathDto[];
};

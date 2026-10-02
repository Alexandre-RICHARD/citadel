import type { DeathDto } from "../death/deathDto.ts";
import type { BossSummaryDto } from "./bossSummaryDto.ts";

export type BossDto = BossSummaryDto & {
	deaths: DeathDto[];
};

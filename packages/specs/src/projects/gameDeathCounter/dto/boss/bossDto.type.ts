import type { DeathDto } from "../death/deathDto.type.ts";
import type { BossSummaryDto } from "./bossSummaryDto.type.ts";

export type BossDto = BossSummaryDto & {
	deaths: DeathDto[];
};

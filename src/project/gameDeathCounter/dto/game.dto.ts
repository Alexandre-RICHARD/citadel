import type { BossSummaryDto } from "./bossSummary.dto.ts";
import type { GameSummaryDto } from "./gameSummary.dto.ts";

export type GameDto = GameSummaryDto & {
	bosses: BossSummaryDto[];
};

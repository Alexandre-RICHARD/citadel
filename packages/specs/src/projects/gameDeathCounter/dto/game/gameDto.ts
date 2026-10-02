import type { BossSummaryDto } from "../boss/bossSummaryDto.ts";
import type { GameSummaryDto } from "./gameSummaryDto.ts";

export type GameDto = GameSummaryDto & {
	bosses: BossSummaryDto[];
};

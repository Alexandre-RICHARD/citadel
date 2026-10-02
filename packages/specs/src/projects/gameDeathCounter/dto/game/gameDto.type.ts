import type { BossSummaryDto } from "../boss/bossSummaryDto.type.ts";
import type { GameSummaryDto } from "./gameSummaryDto.type.ts";

export type GameDto = GameSummaryDto & {
	bosses: BossSummaryDto[];
};

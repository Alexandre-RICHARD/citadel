import type { GameDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameDto.type";

import { fromBossSummaryDtoToBossSummaryFm } from "./fromBossSummaryDtoToBossSummaryFm";
import { fromGameSummaryDtoToGameSummaryFm } from "./fromGameSummaryDtoToGameSummaryFm";
import type { GameFm } from "./gameFm.type";

export function fromGameDtoToGameFm(game: GameDto): GameFm {
	return {
		...fromGameSummaryDtoToGameSummaryFm(game),
		bosses: game.bosses.map(fromBossSummaryDtoToBossSummaryFm),
	};
}

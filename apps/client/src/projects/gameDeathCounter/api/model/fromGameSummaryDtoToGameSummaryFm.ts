import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type";

import { isTemporaryId } from "../../../../common/api/mutation/isTemporaryId";
import type { GameSummaryFm } from "./gameSummaryFm.type";

export function fromGameSummaryDtoToGameSummaryFm(
	game: GameSummaryDto,
): GameSummaryFm {
	return {
		id: game.id,
		name: game.name,
		startedAt: game.startedAt,
		endedAt: game.endedAt,
		totalDeath: game.totalDeath,
		isFinished: game.endedAt !== null,
		isTemporary: isTemporaryId(game.id),
	};
}

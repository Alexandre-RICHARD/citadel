import type { BossSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossSummaryDto.type";
import type { GameDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

// undefined : jeu jamais déplié
export function getCachedBosses(
	queryClient: QueryClient,
	gameId: number,
): BossSummaryDto[] | undefined {
	return queryClient.getQueryData<GameDto>(
		gameDeathCounterQueryKeys.game(gameId),
	)?.bosses;
}

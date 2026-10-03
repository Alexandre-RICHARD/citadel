import type { GameDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

// Sans effet si le jeu n'a jamais été déplié
export function updateCachedGame(
	queryClient: QueryClient,
	gameId: number,
	update: (game: GameDto) => GameDto,
): void {
	queryClient.setQueryData<GameDto>(
		gameDeathCounterQueryKeys.game(gameId),
		(game) => (game === undefined ? undefined : update(game)),
	);
}

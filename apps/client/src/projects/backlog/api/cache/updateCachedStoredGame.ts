import type { StoredGameDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";

// Sans effet si le jeu n'a pas été lu
export function updateCachedStoredGame(
	queryClient: QueryClient,
	gameId: number,
	update: (game: StoredGameDto) => StoredGameDto,
): void {
	queryClient.setQueryData<StoredGameDto>(
		backlogQueryKeys.storedGame(gameId),
		(game) => (game === undefined ? undefined : update(game)),
	);
}

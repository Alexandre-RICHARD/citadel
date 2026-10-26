import type { StoredGameDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";

// undefined : jeu pas encore lu
export function getCachedStoredGame(
	queryClient: QueryClient,
	gameId: number,
): StoredGameDto | undefined {
	return queryClient.getQueryData<StoredGameDto>(
		backlogQueryKeys.storedGame(gameId),
	);
}

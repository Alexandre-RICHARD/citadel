import type { StoredGameDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { updateCachedQueryData } from "../../../../common/api/cache/updateCachedQueryData";
import { backlogQueryKeys } from "../backlogQueryKeys";

// Sans effet si le jeu n'a pas été lu
export function updateCachedStoredGame(
	queryClient: QueryClient,
	gameId: number,
	update: (game: StoredGameDto) => StoredGameDto,
): void {
	updateCachedQueryData(
		queryClient,
		backlogQueryKeys.storedGame(gameId),
		update,
	);
}

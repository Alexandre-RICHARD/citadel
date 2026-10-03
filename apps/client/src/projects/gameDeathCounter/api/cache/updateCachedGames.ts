import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type";
import type { GetAllGames } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getAllGames/getAllGamesEndpoint.interface";
import type { QueryClient } from "@tanstack/react-query";

import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

// Sans effet si la liste n'est pas chargée. null (réponse 204) se lit comme une liste vide
export function updateCachedGames(
	queryClient: QueryClient,
	update: (games: GameSummaryDto[]) => GameSummaryDto[],
): void {
	queryClient.setQueryData<GetAllGames["response"]["data"]>(
		gameDeathCounterQueryKeys.gameList(),
		(gameList) =>
			gameList === undefined
				? undefined
				: { games: update(gameList?.games ?? []) },
	);
}

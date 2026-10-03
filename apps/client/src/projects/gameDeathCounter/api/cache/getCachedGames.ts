import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type";
import type { GetAllGames } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getAllGames/getAllGamesEndpoint.interface";
import type { QueryClient } from "@tanstack/react-query";

import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

// undefined : liste pas encore chargée
export function getCachedGames(
	queryClient: QueryClient,
): GameSummaryDto[] | undefined {
	const gameList = queryClient.getQueryData<GetAllGames["response"]["data"]>(
		gameDeathCounterQueryKeys.gameList(),
	);
	return gameList === undefined ? undefined : (gameList?.games ?? []);
}

import type { GetAllGames } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getAllGames/getAllGamesEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { queryOptions } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

// Partagé par la liste (Suspense) et le total de l'en-tête (sans Suspense) : une seule requête pour les deux
export const gameListQueryOptions = queryOptions({
	queryKey: gameDeathCounterQueryKeys.gameList(),
	queryFn: async ({ signal }) =>
		(
			await fetchHandler<GetAllGames>(
				{
					url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games`,
					method: HttpMethodEnum.GET,
					protected: false,
				},
				{ signal },
			)
		).data,
});

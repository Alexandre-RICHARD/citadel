import type { GetOneGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getOneGame/getOneGameEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useSuspenseQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";
import { fromGameDtoToGameFm } from "../model/fromGameDtoToGameFm";
import type { GameFm } from "../model/gameFm.type";

// Détail d'un jeu, chargé à son dépliage
export function useGame(gameId: number): GameFm {
	return useSuspenseQuery({
		queryKey: gameDeathCounterQueryKeys.game(gameId),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetOneGame>(
					{
						url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:id`,
						method: HttpMethodEnum.GET,
						protected: false,
						pathParams: { id: gameId },
					},
					{ signal },
				)
			).data,
		select: fromGameDtoToGameFm,
	}).data;
}

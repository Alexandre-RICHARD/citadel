import type { GetStoredGame } from "@citadel/specs/src/projects/backlog/endpoint/games/getStoredGame/getStoredGameEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromStoredGameDtoToStoredGameFm } from "../model/fromStoredGameDtoToStoredGameFm";
import type { StoredGameFm } from "../model/storedGameFm.type";

// Un jeu en base, pour l'ajout au backlog ou d'une version jouée ; sans suspendre, la modale montre son chargement
export function useStoredGame(gameId: number): UseQueryResult<StoredGameFm> {
	return useQuery({
		queryKey: backlogQueryKeys.storedGame(gameId),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetStoredGame>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/games/:gameId`,
						method: HttpMethodEnum.GET,
						protected: false,
						pathParams: { gameId },
					},
					{ signal },
				)
			).data,
		select: fromStoredGameDtoToStoredGameFm,
	});
}

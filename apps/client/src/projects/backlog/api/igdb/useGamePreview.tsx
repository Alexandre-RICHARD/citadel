import type { GetGamePreview } from "@citadel/specs/src/projects/backlog/endpoint/igdb/getGamePreview/getGamePreviewEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromGamePreviewDtoToGamePreviewFm } from "../model/fromGamePreviewDtoToGamePreviewFm";
import type { GamePreviewFm } from "../model/gamePreviewFm.type";

/**
 * Modale du jeu : sa fiche IGDB, ou le jeu en base complété depuis IGDB. Lue à l'ouverture, sans suspendre :
 * la modale montre son chargement et son erreur
 */
export function useGamePreview(igdbId: number): UseQueryResult<GamePreviewFm> {
	return useQuery({
		queryKey: backlogQueryKeys.gamePreview(igdbId),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetGamePreview>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/igdb/games/:igdbId`,
						method: HttpMethodEnum.GET,
						protected: false,
						pathParams: { igdbId },
					},
					{ signal },
				)
			).data,
		select: fromGamePreviewDtoToGamePreviewFm,
	});
}

import type { GetConnectedShowSeasons } from "@citadel/specs/src/projects/backlog/endpoint/nas/getConnectedShowSeasons/getConnectedShowSeasonsEndpoint.interface";
import type { GetShowSeasons } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getShowSeasons/getShowSeasonsEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { queryOptions } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";

/**
 * Les saisons d'une série et leurs épisodes : lues au dépliage, et par les dialogues de « Vu » et de « Vérifié ». En mode
 * connecté, avec leurs colonnes du NAS, sous la même clé : les écritures de « Vu » les mettent à jour de la même façon, et
 * changer de mode vide ce cache (forgetModeDependentData)
 */
export function showSeasonsQueryOptions(
	userMediaId: number,
	isConnected: boolean,
) {
	return queryOptions({
		queryKey: backlogQueryKeys.showSeasons(userMediaId),
		queryFn: async ({ signal }) =>
			isConnected
				? (
						await fetchHandler<GetConnectedShowSeasons>(
							{
								url: `${ApiPrefixEnum.BACKLOG}/nas/user-media/:userMediaId/seasons`,
								method: HttpMethodEnum.GET,
								protected: true,
								pathParams: { userMediaId },
							},
							{ signal },
						)
					).data
				: (
						await fetchHandler<GetShowSeasons>(
							{
								url: `${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId/seasons`,
								method: HttpMethodEnum.GET,
								protected: true,
								pathParams: { userMediaId },
							},
							{ signal },
						)
					).data,
	});
}

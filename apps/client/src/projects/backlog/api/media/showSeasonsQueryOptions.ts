import type { GetShowSeasons } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getShowSeasons/getShowSeasonsEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { queryOptions } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";

// Les saisons d'une série et leurs épisodes : lues au dépliage, et par les dialogues de « Vu »
export function showSeasonsQueryOptions(userMediaId: number) {
	return queryOptions({
		queryKey: backlogQueryKeys.showSeasons(userMediaId),
		queryFn: async ({ signal }) =>
			(
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

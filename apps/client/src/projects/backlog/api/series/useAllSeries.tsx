import type { GetAllSeries } from "@citadel/specs/src/projects/backlog/endpoint/series/getAllSeries/getAllSeriesEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import type { SeriesFm } from "../model/seriesFm.type";

// Toutes les séries de la base, triées par nom ; une liste vide tant qu'elles ne sont pas chargées
export function useAllSeries(): SeriesFm[] {
	return (
		useQuery({
			queryKey: backlogQueryKeys.allSeries(),
			queryFn: async ({ signal }) =>
				(
					await fetchHandler<GetAllSeries>(
						{
							url: `${ApiPrefixEnum.BACKLOG}/series`,
							method: HttpMethodEnum.GET,
							protected: false,
						},
						{ signal },
					)
				).data,
			select: (data) => data?.series ?? [],
		}).data ?? []
	);
}

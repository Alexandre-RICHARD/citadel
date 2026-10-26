import type { GetSeriesEntries } from "@citadel/specs/src/projects/backlog/endpoint/series/getSeriesEntries/getSeriesEntriesEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import type { SeriesEntryFm } from "../model/seriesEntryFm.type";

type SeriesEntries = {
	// null tant qu'ils ne sont pas chargés ; vide sans série
	entries: SeriesEntryFm[] | null;
	error: ApiError | null;
	// Lecture périmée (invalidée par une écriture), relue au prochain affichage
	isStale: boolean;
};

/**
 * Les jeux du backlog d'une série, par numéro. seriesId null, ou provisoire (série pas encore créée) : rien à lire, la
 * série n'a pas encore de jeu
 */
export function useSeriesEntries(seriesId: number | null): SeriesEntries {
	const hasSeries = seriesId !== null && seriesId > 0;
	const entries = useQuery({
		queryKey: backlogQueryKeys.seriesEntries(seriesId ?? 0),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetSeriesEntries>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/series/:seriesId/entries`,
						method: HttpMethodEnum.GET,
						protected: false,
						pathParams: { seriesId: seriesId ?? 0 },
					},
					{ signal },
				)
			).data,
		enabled: hasSeries,
		select: (data) => data?.entries ?? [],
	});
	if (!hasSeries) return { entries: [], error: null, isStale: false };
	return {
		entries: entries.data ?? null,
		error: entries.error as ApiError | null,
		isStale: entries.isStale,
	};
}

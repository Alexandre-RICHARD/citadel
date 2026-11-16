import type { SearchTmdbMedia } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/searchTmdbMedia/searchTmdbMediaEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromTmdbSearchResultDtoToTmdbHitFm } from "../model/media/fromTmdbSearchResultDtoToTmdbHitFm";
import type { TmdbHitFm } from "../model/media/tmdbHitFm.type";

type TmdbSearch = {
	results: TmdbHitFm[];
	isSearching: boolean;
	error: ApiError | null;
};

/**
 * Recherche TMDB de la barre du haut, films et séries ensemble, déjà temporisée par l'appelant ; rien sans saisie. Les
 * résultats précédents restent affichés pendant la recherche suivante
 */
export function useTmdbSearch(query: string): TmdbSearch {
	const trimmedQuery = query.trim();
	const search = useQuery({
		queryKey: backlogQueryKeys.tmdbSearch(trimmedQuery),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<SearchTmdbMedia>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/tmdb/search`,
						method: HttpMethodEnum.GET,
						protected: true,
						queryParams: { query: trimmedQuery },
					},
					{ signal },
				)
			).data,
		enabled: trimmedQuery !== "",
		placeholderData: keepPreviousData,
		select: (data) => (data ?? []).map(fromTmdbSearchResultDtoToTmdbHitFm),
	});
	return {
		results: trimmedQuery === "" ? [] : (search.data ?? []),
		isSearching: search.isFetching,
		error: search.error as ApiError | null,
	};
}

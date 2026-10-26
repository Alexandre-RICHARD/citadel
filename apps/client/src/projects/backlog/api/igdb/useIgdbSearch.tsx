import type { SearchIgdbGames } from "@citadel/specs/src/projects/backlog/endpoint/igdb/searchIgdbGames/searchIgdbGamesEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromIgdbSearchResultDtoToGameHitFm } from "../model/fromIgdbSearchResultDtoToGameHitFm";
import type { GameHitFm } from "../model/gameHitFm.type";

type IgdbSearch = {
	results: GameHitFm[];
	isSearching: boolean;
	error: ApiError | null;
};

/**
 * Recherche IGDB de la barre du haut, déjà temporisée par l'appelant ; rien sans saisie. Les résultats précédents
 * restent affichés pendant la recherche suivante
 */
export function useIgdbSearch(query: string): IgdbSearch {
	const trimmedQuery = query.trim();
	const search = useQuery({
		queryKey: backlogQueryKeys.igdbSearch(trimmedQuery),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<SearchIgdbGames>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/igdb/search`,
						method: HttpMethodEnum.GET,
						protected: false,
						queryParams: { query: trimmedQuery },
					},
					{ signal },
				)
			).data,
		enabled: trimmedQuery !== "",
		placeholderData: keepPreviousData,
		select: (data) =>
			(data?.results ?? []).map(fromIgdbSearchResultDtoToGameHitFm),
	});
	return {
		results: trimmedQuery === "" ? [] : (search.data ?? []),
		isSearching: search.isFetching,
		error: search.error as ApiError | null,
	};
}

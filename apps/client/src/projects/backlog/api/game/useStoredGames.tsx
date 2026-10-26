import type { GetStoredGames } from "@citadel/specs/src/projects/backlog/endpoint/games/getStoredGames/getStoredGamesEndpoint.interface";
import { BacklogPageSizeEnum } from "@citadel/specs/src/projects/backlog/rule/view/backlogPageSize.enum";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromStoredGameSummaryDtoToGameHitFm } from "../model/fromStoredGameSummaryDtoToGameHitFm";
import type { GameHitFm } from "../model/gameHitFm.type";

type StoredGames = {
	games: GameHitFm[];
	totalCount: number;
	isLoading: boolean;
	error: ApiError | null;
	hasNextPage: boolean;
	fetchNextPage: () => void;
};

/**
 * « Ma base » : les jeux hors backlog, par pages de 50, filtrés par la saisie déjà temporisée.
 * La liste précédente reste affichée pendant la lecture de la suivante
 */
export function useStoredGames(query: string): StoredGames {
	const trimmedQuery = query.trim();
	const list = useInfiniteQuery({
		queryKey: backlogQueryKeys.storedGameList(trimmedQuery),
		queryFn: async ({ pageParam, signal }) =>
			(
				await fetchHandler<GetStoredGames>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/games`,
						method: HttpMethodEnum.GET,
						protected: false,
						queryParams: { query: trimmedQuery, page: pageParam },
					},
					{ signal },
				)
			).data,
		initialPageParam: 1,
		getNextPageParam: (lastPage, _pages, lastPageParam) =>
			lastPage !== null &&
			lastPageParam * Number(BacklogPageSizeEnum.STORED_GAMES) <
				lastPage.totalCount
				? lastPageParam + 1
				: undefined,
		placeholderData: keepPreviousData,
	});
	const pages = list.data?.pages ?? [];
	return {
		games: pages.flatMap((page) =>
			(page?.games ?? []).map(fromStoredGameSummaryDtoToGameHitFm),
		),
		totalCount: pages.at(0)?.totalCount ?? 0,
		isLoading: list.isPending,
		error: list.error as ApiError | null,
		hasNextPage: list.hasNextPage,
		fetchNextPage: () => {
			if (!list.isFetchingNextPage) void list.fetchNextPage();
		},
	};
}

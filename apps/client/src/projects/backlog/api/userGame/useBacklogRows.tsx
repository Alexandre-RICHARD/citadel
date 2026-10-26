import type { GetUserGames } from "@citadel/specs/src/projects/backlog/endpoint/userGames/getUserGames/getUserGamesEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import type { BacklogView } from "../../helper/view/backlogView.type";
import { buildViewParams } from "../../helper/view/buildViewParams";
import { backlogQueryKeys } from "../backlogQueryKeys";
import type { BacklogRowsFm } from "../model/backlogRowsFm.type";
import { fromUserGameListPagesToBacklogRowsFm } from "../model/fromUserGameListPagesToBacklogRowsFm";
import { buildUserGamesQueryParams } from "./buildUserGamesQueryParams";

type BacklogRows = BacklogRowsFm & {
	hasNextPage: boolean;
	fetchNextPage: () => void;
};

/**
 * Le tableau (cahier des charges, §9) : la première page suspend, les suivantes se chargent au défilement. Le serveur
 * trie et filtre ; chaque vue (tri, filtres) a sa propre clé de cache
 */
export function useBacklogRows(view: BacklogView): BacklogRows {
	const rows = useSuspenseInfiniteQuery({
		queryKey: backlogQueryKeys.userGameList(buildViewParams(view)),
		queryFn: async ({ pageParam, signal }) =>
			(
				await fetchHandler<GetUserGames>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/user-games`,
						method: HttpMethodEnum.GET,
						protected: false,
						queryParams: buildUserGamesQueryParams(view, pageParam),
					},
					{ signal },
				)
			).data,
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages, lastPageParam) => {
			const loadedCount = pages.reduce(
				(count, page) => count + (page?.userGames.length ?? 0),
				0,
			);
			return lastPage !== null && loadedCount < lastPage.matchedCount
				? lastPageParam + 1
				: undefined;
		},
		select: fromUserGameListPagesToBacklogRowsFm,
	});
	return {
		...rows.data,
		hasNextPage: rows.hasNextPage,
		fetchNextPage: () => {
			if (!rows.isFetchingNextPage) void rows.fetchNextPage();
		},
	};
}

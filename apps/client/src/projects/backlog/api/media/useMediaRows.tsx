import type { GetAllUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getAllUserMedia/getAllUserMediaEndpoint.interface";
import type { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import type { BacklogView } from "../../helper/view/backlogView.type";
import { buildViewParams } from "../../helper/view/buildViewParams";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromUserMediaListPagesToMediaRowsFm } from "../model/media/fromUserMediaListPagesToMediaRowsFm";
import type { MediaRowsFm } from "../model/media/mediaRowsFm.type";
import { buildUserMediaQueryParams } from "./buildUserMediaQueryParams";

type MediaRows = MediaRowsFm & {
	hasNextPage: boolean;
	fetchNextPage: () => void;
};

/**
 * Le tableau des films et séries : la première page suspend, les suivantes se chargent au défilement. Le serveur trie et
 * filtre ; chaque vue (tri, filtres) a sa propre clé de cache
 */
export function useMediaRows(view: BacklogView<MediaColumnEnum>): MediaRows {
	const rows = useSuspenseInfiniteQuery({
		queryKey: backlogQueryKeys.userMediaList(buildViewParams(view)),
		queryFn: async ({ pageParam, signal }) =>
			(
				await fetchHandler<GetAllUserMedia>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/user-media`,
						method: HttpMethodEnum.GET,
						protected: true,
						queryParams: buildUserMediaQueryParams(view, pageParam),
					},
					{ signal },
				)
			).data,
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages, lastPageParam) => {
			const loadedCount = pages.reduce(
				(count, page) => count + (page?.userMedia.length ?? 0),
				0,
			);
			return lastPage !== null && loadedCount < lastPage.matchedCount
				? lastPageParam + 1
				: undefined;
		},
		select: fromUserMediaListPagesToMediaRowsFm,
	});
	return {
		...rows.data,
		hasNextPage: rows.hasNextPage,
		fetchNextPage: () => {
			if (!rows.isFetchingNextPage) void rows.fetchNextPage();
		},
	};
}

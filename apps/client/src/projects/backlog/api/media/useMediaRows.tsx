import type { ConnectedUserMediaListDto } from "@citadel/specs/src/projects/backlog/dto/nas/connectedUserMediaListDto.type";
import type { UserMediaListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaListDto.type";
import type { GetConnectedUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/nas/getConnectedUserMedia/getConnectedUserMediaEndpoint.interface";
import type { GetAllUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getAllUserMedia/getAllUserMediaEndpoint.interface";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";
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

// Le mode connecté a ses propres vues en cache, toujours sous userMediaLists : une écriture met à jour les deux modes
const CONNECTED_MODE_PARAM = { mode: "nas" };

async function fetchPage(
	view: BacklogView<ConnectedMediaColumn>,
	page: number,
	isConnected: boolean,
	signal: AbortSignal,
): Promise<UserMediaListDto | ConnectedUserMediaListDto | null> {
	if (isConnected)
		return (
			await fetchHandler<GetConnectedUserMedia>(
				{
					url: `${ApiPrefixEnum.BACKLOG}/nas/user-media`,
					method: HttpMethodEnum.GET,
					protected: true,
					queryParams: buildUserMediaQueryParams(view, page),
				},
				{ signal },
			)
		).data;
	return (
		await fetchHandler<GetAllUserMedia>(
			{
				url: `${ApiPrefixEnum.BACKLOG}/user-media`,
				method: HttpMethodEnum.GET,
				protected: true,
				queryParams: buildUserMediaQueryParams(view, page),
			},
			{ signal },
		)
	).data;
}

/**
 * Le tableau des films et séries : la première page suspend, les suivantes se chargent au défilement. Le serveur trie et
 * filtre ; chaque vue (tri, filtres, mode) a sa propre clé de cache. En mode connecté, les lignes portent les colonnes
 * du NAS
 */
export function useMediaRows(
	view: BacklogView<ConnectedMediaColumn>,
	isConnected: boolean,
): MediaRows {
	const rows = useSuspenseInfiniteQuery({
		queryKey: backlogQueryKeys.userMediaList({
			...buildViewParams(view),
			...(isConnected && CONNECTED_MODE_PARAM),
		}),
		queryFn: async ({ pageParam, signal }) =>
			fetchPage(view, pageParam, isConnected, signal),
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

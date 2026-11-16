import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../../backlogQueryKeys";
import type { RemovedUserGamePosition } from "../removedUserGamePosition.type";
import { shiftMediaListCounts } from "./shiftMediaListCounts";
import type { UserMediaListData } from "./userMediaListData.type";

/**
 * Retire la ligne d'un média de chaque vue du tableau en cache ; rend la ligne et ses places, pour la remettre au besoin.
 * Le résumé, porté par chaque page, baisse partout où elle était
 */
export function removeCachedUserMedia(
	queryClient: QueryClient,
	userMediaId: number,
): { userMedia: UserMediaDto; positions: RemovedUserGamePosition[] } | null {
	let removed: UserMediaDto | null = null;
	const positions: RemovedUserGamePosition[] = [];
	for (const [queryKey, data] of queryClient.getQueriesData<UserMediaListData>({
		queryKey: backlogQueryKeys.userMediaLists(),
	})) {
		if (data === undefined) continue;
		const pageIndex = data.pages.findIndex(
			(page) => page?.userMedia.some(({ id }) => id === userMediaId) === true,
		);
		const page = data.pages[pageIndex];
		if (page === undefined || page === null) continue;
		const index = page.userMedia.findIndex(({ id }) => id === userMediaId);
		const userMedia = page.userMedia[index];
		if (userMedia === undefined) continue;
		removed = userMedia;
		positions.push({ queryKey, pageIndex, index });
		queryClient.setQueryData<UserMediaListData>(queryKey, {
			...data,
			pages: data.pages.map((current) =>
				current === null
					? null
					: {
							...current,
							...shiftMediaListCounts(current, userMedia.mediaType, -1),
							userMedia: current.userMedia.filter(
								({ id }) => id !== userMediaId,
							),
						},
			),
		});
	}
	return removed === null ? null : { userMedia: removed, positions };
}

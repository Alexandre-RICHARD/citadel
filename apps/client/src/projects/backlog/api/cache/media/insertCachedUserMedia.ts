import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../../backlogQueryKeys";
import { shiftMediaListCounts } from "./shiftMediaListCounts";
import type { UserMediaListData } from "./userMediaListData.type";

/**
 * Une nouvelle ligne en tête de chaque vue du tableau en cache, pour qu'elle se voie tout de suite ; la resynchronisation
 * qui suit la mutation la remet à sa place selon le tri et les filtres. Le résumé, porté par chaque page, suit. Une vue
 * d'un backlog vide (204) reste vide jusqu'à la resynchronisation : elle n'a pas de résumé à faire suivre
 */
export function insertCachedUserMedia(
	queryClient: QueryClient,
	userMedia: UserMediaDto,
): void {
	queryClient.setQueriesData<UserMediaListData>(
		{ queryKey: backlogQueryKeys.userMediaLists() },
		(data) => {
			if (data === undefined) return undefined;
			const [firstPage = null, ...otherPages] = data.pages;
			if (firstPage === null) return data;
			return {
				...data,
				pages: [
					{
						...firstPage,
						...shiftMediaListCounts(firstPage, userMedia.mediaType, 1),
						userMedia: [userMedia, ...firstPage.userMedia],
					},
					...otherPages.map((page) =>
						page === null
							? null
							: {
									...page,
									...shiftMediaListCounts(page, userMedia.mediaType, 1),
								},
					),
				],
			};
		},
	);
}

import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";
import type { UserGameListData } from "./userGameListData.type";

/**
 * Une nouvelle ligne en tête de chaque vue du tableau en cache, pour qu'elle se voie tout de suite ; la resynchronisation
 * qui suit la mutation la remet à sa place selon le tri et les filtres. Le total des jeux de la vue, porté par chaque
 * page, monte partout
 */
export function insertCachedUserGame(
	queryClient: QueryClient,
	userGame: UserGameDto,
): void {
	queryClient.setQueriesData<UserGameListData>(
		{ queryKey: backlogQueryKeys.userGames() },
		(data) => {
			if (data === undefined) return undefined;
			const [firstPage = null, ...otherPages] = data.pages;
			return {
				...data,
				pages: [
					{
						userGames: [userGame, ...(firstPage?.userGames ?? [])],
						matchedCount: (firstPage?.matchedCount ?? 0) + 1,
					},
					...otherPages.map((page) =>
						page === null
							? null
							: { ...page, matchedCount: page.matchedCount + 1 },
					),
				],
			};
		},
	);
}

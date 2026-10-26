import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";
import type { RemovedUserGamePosition } from "./removedUserGamePosition.type";
import type { UserGameListData } from "./userGameListData.type";

/**
 * Retire la ligne d'un jeu de chaque vue du tableau en cache ; rend la ligne et ses places, pour la remettre au besoin.
 * Chaque page porte le total des jeux de la vue : il baisse partout
 */
export function removeCachedUserGame(
	queryClient: QueryClient,
	gameId: number,
): { userGame: UserGameDto; positions: RemovedUserGamePosition[] } | null {
	let removed: UserGameDto | null = null;
	const positions: RemovedUserGamePosition[] = [];
	for (const [queryKey, data] of queryClient.getQueriesData<UserGameListData>({
		queryKey: backlogQueryKeys.userGames(),
	})) {
		if (data === undefined) continue;
		const pageIndex = data.pages.findIndex(
			(page) => page?.userGames.some(({ game }) => game.id === gameId) === true,
		);
		const page = data.pages[pageIndex];
		if (page === undefined || page === null) continue;
		const index = page.userGames.findIndex(({ game }) => game.id === gameId);
		removed = page.userGames[index] ?? removed;
		positions.push({ queryKey, pageIndex, index });
		queryClient.setQueryData<UserGameListData>(queryKey, {
			...data,
			pages: data.pages.map((current) =>
				current === null
					? null
					: {
							userGames: current.userGames.filter(
								({ game }) => game.id !== gameId,
							),
							matchedCount: current.matchedCount - 1,
						},
			),
		});
	}
	return removed === null ? null : { userGame: removed, positions };
}

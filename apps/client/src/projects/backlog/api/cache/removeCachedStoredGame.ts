import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";
import type { StoredGameListData } from "./storedGameListData.type";
import type { StoredGameListSnapshot } from "./storedGameListSnapshot.type";

/**
 * Retire un jeu de chaque liste « Ajouter un jeu depuis la Citadel » en cache (une par saisie de filtre) ; rend les
 * listes d'avant, pour les remettre au besoin. Chaque page porte le total de la liste : il baisse partout
 */
export function removeCachedStoredGame(
	queryClient: QueryClient,
	gameId: number,
): StoredGameListSnapshot[] {
	const snapshots: StoredGameListSnapshot[] = [];
	for (const [queryKey, data] of queryClient.getQueriesData<StoredGameListData>(
		{ queryKey: backlogQueryKeys.storedGames() },
	)) {
		const isListed =
			data?.pages.some(
				(page) => page?.games.some(({ id }) => id === gameId) === true,
			) === true;
		if (data === undefined || !isListed) continue;
		snapshots.push({ queryKey, data });
		queryClient.setQueryData<StoredGameListData>(queryKey, {
			...data,
			pages: data.pages.map((page) =>
				page === null
					? null
					: {
							games: page.games.filter(({ id }) => id !== gameId),
							totalCount: page.totalCount - 1,
						},
			),
		});
	}
	return snapshots;
}

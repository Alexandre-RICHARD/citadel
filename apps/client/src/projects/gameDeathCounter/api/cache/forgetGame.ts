import type { QueryClient } from "@tanstack/react-query";

import { removeById } from "../../../../common/api/cache/removeById";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";
import { getCachedBosses } from "./getCachedBosses";
import { updateCachedGames } from "./updateCachedGames";

// Jeu supprimé : il quitte la liste, et son détail comme celui de ses boss quittent le cache
export function forgetGame(queryClient: QueryClient, gameId: number): void {
	getCachedBosses(queryClient, gameId)?.forEach((boss) =>
		queryClient.removeQueries({
			queryKey: gameDeathCounterQueryKeys.boss(boss.id),
		}),
	);
	queryClient.removeQueries({
		queryKey: gameDeathCounterQueryKeys.game(gameId),
	});
	updateCachedGames(queryClient, (games) => removeById(games, gameId));
}

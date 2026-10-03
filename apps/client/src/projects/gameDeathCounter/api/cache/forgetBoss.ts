import type { QueryClient } from "@tanstack/react-query";

import { removeById } from "../../../../common/api/cache/removeById";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";
import { updateCachedGame } from "./updateCachedGame";

type Ids = { gameId: number; bossId: number };

// Boss supprimé : il quitte son jeu, et son détail quitte le cache
export function forgetBoss(
	queryClient: QueryClient,
	{ gameId, bossId }: Ids,
): void {
	queryClient.removeQueries({
		queryKey: gameDeathCounterQueryKeys.boss(bossId),
	});
	updateCachedGame(queryClient, gameId, (game) => ({
		...game,
		bosses: removeById(game.bosses, bossId),
	}));
}

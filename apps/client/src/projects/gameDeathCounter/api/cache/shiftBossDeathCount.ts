import type { QueryClient } from "@tanstack/react-query";

import { shiftGameDeathCount } from "./shiftGameDeathCount";
import { updateCachedBoss } from "./updateCachedBoss";
import { updateCachedBossSummary } from "./updateCachedBossSummary";

type Ids = { gameId: number; bossId: number };

// Total d'un boss partout où il est en cache, et celui de son jeu avec lui
export function shiftBossDeathCount(
	queryClient: QueryClient,
	ids: Ids,
	delta: number,
): void {
	updateCachedBossSummary(queryClient, ids, (boss) => ({
		...boss,
		totalDeath: boss.totalDeath + delta,
	}));
	updateCachedBoss(queryClient, ids.bossId, (boss) => ({
		...boss,
		totalDeath: boss.totalDeath + delta,
	}));
	shiftGameDeathCount(queryClient, ids.gameId, delta);
}

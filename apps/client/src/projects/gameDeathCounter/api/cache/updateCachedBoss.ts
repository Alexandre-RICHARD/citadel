import type { BossDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

// Sans effet si le boss n'a jamais été déplié
export function updateCachedBoss(
	queryClient: QueryClient,
	bossId: number,
	update: (boss: BossDto) => BossDto,
): void {
	queryClient.setQueryData<BossDto>(
		gameDeathCounterQueryKeys.boss(bossId),
		(boss) => (boss === undefined ? undefined : update(boss)),
	);
}

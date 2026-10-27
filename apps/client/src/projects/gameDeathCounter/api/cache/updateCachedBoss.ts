import type { BossDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { updateCachedQueryData } from "../../../../common/api/cache/updateCachedQueryData";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

// Sans effet si le boss n'a jamais été déplié
export function updateCachedBoss(
	queryClient: QueryClient,
	bossId: number,
	update: (boss: BossDto) => BossDto,
): void {
	updateCachedQueryData(
		queryClient,
		gameDeathCounterQueryKeys.boss(bossId),
		update,
	);
}

import type { BossDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossDto.type";
import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/deathDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

// undefined : boss jamais déplié
export function getCachedDeaths(
	queryClient: QueryClient,
	bossId: number,
): DeathDto[] | undefined {
	return queryClient.getQueryData<BossDto>(
		gameDeathCounterQueryKeys.boss(bossId),
	)?.deaths;
}

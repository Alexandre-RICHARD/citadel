import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/deathDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { replaceById } from "../../../../common/api/cache/replaceById";
import { updateCachedBoss } from "./updateCachedBoss";

type Ids = { bossId: number; deathId: number };

// Une mort dans le détail de son boss
export function updateCachedDeath(
	queryClient: QueryClient,
	{ bossId, deathId }: Ids,
	update: (death: DeathDto) => DeathDto,
): void {
	updateCachedBoss(queryClient, bossId, (boss) => ({
		...boss,
		deaths: replaceById(boss.deaths, deathId, update),
	}));
}

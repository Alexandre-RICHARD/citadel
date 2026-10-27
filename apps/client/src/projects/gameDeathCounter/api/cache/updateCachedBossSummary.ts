import { replaceById } from "@citadel/common/src/universal/array/replaceById";
import type { BossSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossSummaryDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { updateCachedGame } from "./updateCachedGame";

type Ids = { gameId: number; bossId: number };

// Un boss dans le détail de son jeu, là où s'affiche sa ligne
export function updateCachedBossSummary(
	queryClient: QueryClient,
	{ gameId, bossId }: Ids,
	update: (boss: BossSummaryDto) => BossSummaryDto,
): void {
	updateCachedGame(queryClient, gameId, (game) => ({
		...game,
		bosses: replaceById(game.bosses, bossId, update),
	}));
}

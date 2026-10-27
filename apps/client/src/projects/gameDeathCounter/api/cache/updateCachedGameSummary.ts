import { replaceById } from "@citadel/common/src/universal/array/replaceById";
import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { updateCachedGames } from "./updateCachedGames";

// Un jeu de la liste
export function updateCachedGameSummary(
	queryClient: QueryClient,
	gameId: number,
	update: (game: GameSummaryDto) => GameSummaryDto,
): void {
	updateCachedGames(queryClient, (games) => replaceById(games, gameId, update));
}

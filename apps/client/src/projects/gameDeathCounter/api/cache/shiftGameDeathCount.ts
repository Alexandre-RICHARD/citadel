import type { QueryClient } from "@tanstack/react-query";

import { updateCachedGame } from "./updateCachedGame";
import { updateCachedGameSummary } from "./updateCachedGameSummary";

// Total d'un jeu, dans la liste et dans son détail. delta négatif pour retirer des morts
export function shiftGameDeathCount(
	queryClient: QueryClient,
	gameId: number,
	delta: number,
): void {
	updateCachedGameSummary(queryClient, gameId, (game) => ({
		...game,
		totalDeath: game.totalDeath + delta,
	}));
	updateCachedGame(queryClient, gameId, (game) => ({
		...game,
		totalDeath: game.totalDeath + delta,
	}));
}

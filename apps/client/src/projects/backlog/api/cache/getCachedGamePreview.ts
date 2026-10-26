import type { GamePreviewDto } from "@citadel/specs/src/projects/backlog/dto/igdb/gamePreviewDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";

// La modale du jeu telle qu'IGDB l'a donnée ; undefined si elle n'a pas été ouverte
export function getCachedGamePreview(
	queryClient: QueryClient,
	igdbId: number,
): GamePreviewDto | undefined {
	return queryClient.getQueryData<GamePreviewDto>(
		backlogQueryKeys.gamePreview(igdbId),
	);
}

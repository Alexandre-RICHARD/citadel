import type { DeleteStoredGame } from "@citadel/specs/src/projects/backlog/endpoint/games/deleteStoredGame/deleteStoredGameEndpoint.interface";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { removeCachedStoredGame } from "../cache/removeCachedStoredGame";
import { restoreCachedStoredGame } from "../cache/restoreCachedStoredGame";
import { shiftOverviewCounts } from "../cache/shiftOverviewCounts";
import type { StoredGameListSnapshot } from "../cache/storedGameListSnapshot.type";

// « Supprimer de la base » : le jeu et ses versions et DLC quittent la base, seulement si aucun backlog ne l'a
export function useDeleteStoredGame(gameId: number) {
	return useOptimisticMutation<
		DeleteStoredGame,
		void,
		StoredGameListSnapshot[]
	>({
		mutationKey: backlogQueryKeys.mutation("deleteStoredGame", gameId),
		scope: `game-${gameId}`,
		actionLabel: "supprimer le jeu de la base",
		buildRequest: () => ({
			url: `${ApiPrefixEnum.BACKLOG}/games/:gameId`,
			method: HttpMethodEnum.DELETE,
			protected: true,
			pathParams: { gameId },
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.storedGames(),
			backlogQueryKeys.storedGame(gameId),
			backlogQueryKeys.overview(),
			backlogQueryKeys.igdbSearches(),
		],
		applyOptimistic: (queryClient) => {
			const snapshots = removeCachedStoredGame(queryClient, gameId);
			if (snapshots.length > 0)
				shiftOverviewCounts(queryClient, { outsideBacklogGameCount: -1 });
			return snapshots;
		},
		revertOptimistic: (queryClient, _variables, snapshots) => {
			restoreCachedStoredGame(queryClient, snapshots);
			if (snapshots.length > 0)
				shiftOverviewCounts(queryClient, { outsideBacklogGameCount: 1 });
		},
		// Le jeu a déjà quitté la base ailleurs : il reste retiré de la liste au lieu de réapparaître
		removeGoneResource: (queryClient, _variables, error) => {
			if (error.code === BacklogErrorCodeEnum.GAME_NOT_FOUND)
				removeCachedStoredGame(queryClient, gameId);
		},
		errorReasons: backlogErrorReasons,
	});
}

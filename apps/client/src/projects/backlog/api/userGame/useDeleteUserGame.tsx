import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import type { DeleteUserGame } from "@citadel/specs/src/projects/backlog/endpoint/userGames/deleteUserGame/deleteUserGameEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { forgetGoneUserGame } from "../cache/forgetGoneUserGame";
import { removeCachedUserGame } from "../cache/removeCachedUserGame";
import type { RemovedUserGamePosition } from "../cache/removedUserGamePosition.type";
import { restoreCachedUserGame } from "../cache/restoreCachedUserGame";
import { shiftOverviewCounts } from "../cache/shiftOverviewCounts";

type Rollback = {
	userGame: UserGameDto;
	positions: RemovedUserGamePosition[];
} | null;

// « Retirer le jeu du backlog » : ses versions jouées et sa personnalisation ; le jeu reste en base
export function useDeleteUserGame(gameId: number) {
	return useOptimisticMutation<DeleteUserGame, void, Rollback>({
		mutationKey: backlogQueryKeys.mutation("deleteUserGame", gameId),
		scope: `game-${gameId}`,
		actionLabel: "retirer le jeu du backlog",
		buildRequest: () => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-games/:gameId`,
			method: HttpMethodEnum.DELETE,
			protected: false,
			pathParams: { gameId },
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userGames(),
			backlogQueryKeys.overview(),
			backlogQueryKeys.storedGames(),
			backlogQueryKeys.storedGame(gameId),
			backlogQueryKeys.allSeries(),
			backlogQueryKeys.seriesEntriesOfAll(),
			backlogQueryKeys.igdbSearches(),
		],
		applyOptimistic: (queryClient) => {
			const removed = removeCachedUserGame(queryClient, gameId);
			if (removed === null) return null;
			shiftOverviewCounts(queryClient, {
				gameCount: -1,
				userVersionCount: -removed.userGame.userVersions.length,
				outsideBacklogGameCount: 1,
			});
			return removed;
		},
		revertOptimistic: (queryClient, _variables, removed) => {
			if (removed === null) return;
			restoreCachedUserGame(queryClient, removed.userGame, removed.positions);
			shiftOverviewCounts(queryClient, {
				gameCount: 1,
				userVersionCount: removed.userGame.userVersions.length,
				outsideBacklogGameCount: -1,
			});
		},
		removeGoneResource: (queryClient, _variables, error) =>
			forgetGoneUserGame(queryClient, error, gameId),
		errorReasons: backlogErrorReasons,
	});
}

import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import type { UserVersionDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userVersionDto.type";
import type { DeleteUserVersion } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/deleteUserVersion/deleteUserVersionEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { insertAt } from "../../../../common/api/cache/insertAt";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { findCachedUserGame } from "../cache/findCachedUserGame";
import { forgetGoneUserGame } from "../cache/forgetGoneUserGame";
import { removeCachedUserGame } from "../cache/removeCachedUserGame";
import type { RemovedUserGamePosition } from "../cache/removedUserGamePosition.type";
import { restoreCachedUserGame } from "../cache/restoreCachedUserGame";
import { shiftOverviewCounts } from "../cache/shiftOverviewCounts";
import { updateCachedUserGame } from "../cache/updateCachedUserGame";

// La version jouée retirée, ou toute la ligne quand c'était la dernière (le jeu quitte le backlog)
type Rollback =
	| { kind: "userVersion"; userVersion: UserVersionDto; index: number }
	| {
			kind: "userGame";
			userGame: UserGameDto;
			positions: RemovedUserGamePosition[];
	  }
	| null;

// « Retirer la version jouée » ; la dernière emporte le jeu du backlog (cahier des charges, §5)
export function useDeleteUserVersion(gameId: number, userVersionId: number) {
	return useOptimisticMutation<DeleteUserVersion, void, Rollback>({
		mutationKey: backlogQueryKeys.mutation("deleteUserVersion", userVersionId),
		scope: `userVersion-${userVersionId}`,
		actionLabel: "retirer la version jouée",
		buildRequest: () => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-versions/:id`,
			method: HttpMethodEnum.DELETE,
			protected: false,
			pathParams: { id: userVersionId },
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userGames(),
			backlogQueryKeys.overview(),
			backlogQueryKeys.storedGames(),
			backlogQueryKeys.storedGame(gameId),
			backlogQueryKeys.allSeries(),
			backlogQueryKeys.seriesEntriesOfAll(),
		],
		applyOptimistic: (queryClient) => {
			const userGame = findCachedUserGame(queryClient, gameId);
			const index =
				userGame?.userVersions.findIndex(({ id }) => id === userVersionId) ??
				-1;
			const userVersion = userGame?.userVersions[index];
			if (userGame === undefined || userVersion === undefined) return null;

			shiftOverviewCounts(queryClient, { userVersionCount: -1 });
			if (userGame.userVersions.length === 1) {
				shiftOverviewCounts(queryClient, {
					gameCount: -1,
					outsideBacklogGameCount: 1,
				});
				const removed = removeCachedUserGame(queryClient, gameId);
				return removed === null ? null : { kind: "userGame", ...removed };
			}
			updateCachedUserGame(queryClient, gameId, (current) => ({
				...current,
				userVersions: current.userVersions.filter(
					({ id }) => id !== userVersionId,
				),
			}));
			return { kind: "userVersion", userVersion, index };
		},
		revertOptimistic: (queryClient, _variables, rollback) => {
			if (rollback === null) return;
			shiftOverviewCounts(queryClient, { userVersionCount: 1 });
			if (rollback.kind === "userGame") {
				shiftOverviewCounts(queryClient, {
					gameCount: 1,
					outsideBacklogGameCount: -1,
				});
				restoreCachedUserGame(
					queryClient,
					rollback.userGame,
					rollback.positions,
				);
				return;
			}
			updateCachedUserGame(queryClient, gameId, (current) => ({
				...current,
				userVersions: insertAt(
					current.userVersions,
					rollback.index,
					rollback.userVersion,
				),
			}));
		},
		// Déjà retirée ailleurs : la ligne se resynchronise
		removeGoneResource: (queryClient, _variables, error) =>
			forgetGoneUserGame(queryClient, error, gameId),
		errorReasons: backlogErrorReasons,
	});
}

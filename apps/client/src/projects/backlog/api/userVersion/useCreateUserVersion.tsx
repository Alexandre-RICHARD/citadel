import type { CreateUserVersionBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionBodyDto.type";
import type { CreateUserVersion } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { createTemporaryId } from "../../../../common/api/mutation/createTemporaryId";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { buildOptimisticUserVersion } from "../cache/buildOptimisticUserVersion";
import { forgetGoneUserGame } from "../cache/forgetGoneUserGame";
import { getCachedStoredGame } from "../cache/getCachedStoredGame";
import { shiftOverviewCounts } from "../cache/shiftOverviewCounts";
import { updateCachedUserGame } from "../cache/updateCachedUserGame";

type Rollback = { temporaryId: number } | null;

// « Ajouter une version jouée » à un jeu déjà dans le backlog ; elle s'affiche grisée en attendant le serveur
export function useCreateUserVersion(gameId: number) {
	return useOptimisticMutation<
		CreateUserVersion,
		CreateUserVersionBodyDto,
		Rollback
	>({
		mutationKey: backlogQueryKeys.mutation("createUserVersion", gameId),
		scope: `game-${gameId}`,
		actionLabel: "ajouter la version jouée",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-games/:gameId/user-versions`,
			method: HttpMethodEnum.POST,
			protected: false,
			pathParams: { gameId },
			body,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userGames(),
			backlogQueryKeys.overview(),
		],
		applyOptimistic: (queryClient, body) => {
			const storedGame = getCachedStoredGame(queryClient, gameId);
			const userVersion =
				storedGame === undefined
					? null
					: buildOptimisticUserVersion(storedGame, body, createTemporaryId());
			if (userVersion === null) return null;
			updateCachedUserGame(queryClient, gameId, (userGame) => ({
				...userGame,
				userVersions: [...userGame.userVersions, userVersion],
			}));
			shiftOverviewCounts(queryClient, { userVersionCount: 1 });
			return { temporaryId: userVersion.id };
		},
		revertOptimistic: (queryClient, _body, rollback) => {
			if (rollback === null) return;
			updateCachedUserGame(queryClient, gameId, (userGame) => ({
				...userGame,
				userVersions: userGame.userVersions.filter(
					({ id }) => id !== rollback.temporaryId,
				),
			}));
			shiftOverviewCounts(queryClient, { userVersionCount: -1 });
		},
		applyServerResponse: (queryClient, userGame) =>
			updateCachedUserGame(queryClient, gameId, () => userGame),
		removeGoneResource: (queryClient, _body, error) =>
			forgetGoneUserGame(queryClient, error, gameId),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}

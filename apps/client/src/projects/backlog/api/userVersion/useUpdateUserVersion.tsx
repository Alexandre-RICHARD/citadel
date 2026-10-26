import type { UserVersionDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userVersionDto.type";
import type { UpdateUserVersionBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/updateUserVersion/updateUserVersionBodyDto.type";
import type { UpdateUserVersion } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/updateUserVersion/updateUserVersionEndpoint.interface";
import { applyFirstFinishCount } from "@citadel/specs/src/projects/backlog/rule/status/applyFirstFinishCount";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { findCachedUserGame } from "../cache/findCachedUserGame";
import { forgetGoneUserGame } from "../cache/forgetGoneUserGame";
import { updateCachedUserGame } from "../cache/updateCachedUserGame";

type Rollback = Partial<UserVersionDto> | null;

// Applique des champs à une version jouée de la ligne du jeu
function patchUserVersion(
	userVersions: UserVersionDto[],
	userVersionId: number,
	patch: Partial<UserVersionDto>,
): UserVersionDto[] {
	return userVersions.map((userVersion) =>
		userVersion.id === userVersionId
			? { ...userVersion, ...patch }
			: userVersion,
	);
}

/**
 * Une cellule du tableau (cellKey, ex. « rating ») : seuls les champs modifiés partent. Une seule modification à la
 * fois par cellule ; celles d'une même version jouée partent dans l'ordre, deux cellules peuvent être en cours ensemble
 */
export function useUpdateUserVersion(
	gameId: number,
	userVersionId: number,
	cellKey: string,
) {
	return useOptimisticMutation<
		UpdateUserVersion,
		UpdateUserVersionBodyDto,
		Rollback
	>({
		mutationKey: backlogQueryKeys.mutation(
			"updateUserVersion",
			userVersionId,
			cellKey,
		),
		scope: `userVersion-${userVersionId}`,
		actionLabel: "modifier la version jouée",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-versions/:id`,
			method: HttpMethodEnum.PATCH,
			protected: false,
			pathParams: { id: userVersionId },
			body,
		}),
		getAffectedQueryKeys: () => [backlogQueryKeys.userGames()],
		applyOptimistic: (queryClient, body) => {
			const current = findCachedUserGame(
				queryClient,
				gameId,
			)?.userVersions.find(({ id }) => id === userVersionId);
			if (current === undefined) return null;
			// La règle du serveur : un statut au rang 5 ou plus compte une première fin, sauf si le compteur est envoyé
			const patch: Partial<UserVersionDto> = {
				...Object.fromEntries(
					Object.entries(body).filter(([, value]) => value !== undefined),
				),
				...(body.status !== undefined &&
					body.sureFinishCount === undefined && {
						sureFinishCount: applyFirstFinishCount(
							body.status,
							current.sureFinishCount,
						),
					}),
			};
			const previous = Object.fromEntries(
				Object.keys(patch).map((field) => [
					field,
					current[field as keyof UserVersionDto],
				]),
			) as Partial<UserVersionDto>;
			updateCachedUserGame(queryClient, gameId, (userGame) => ({
				...userGame,
				userVersions: patchUserVersion(
					userGame.userVersions,
					userVersionId,
					patch,
				),
			}));
			return previous;
		},
		revertOptimistic: (queryClient, _body, previous) => {
			if (previous)
				updateCachedUserGame(queryClient, gameId, (userGame) => ({
					...userGame,
					userVersions: patchUserVersion(
						userGame.userVersions,
						userVersionId,
						previous,
					),
				}));
		},
		applyServerResponse: (queryClient, userGame) =>
			updateCachedUserGame(queryClient, gameId, () => userGame),
		removeGoneResource: (queryClient, _body, error) =>
			forgetGoneUserGame(queryClient, error, gameId),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}

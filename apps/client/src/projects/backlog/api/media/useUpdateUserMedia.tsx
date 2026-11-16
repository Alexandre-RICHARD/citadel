import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import type { UpdateUserMediaBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/updateUserMedia/updateUserMediaBodyDto.type";
import type { UpdateUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/updateUserMedia/updateUserMediaEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { findCachedUserMedia } from "../cache/media/findCachedUserMedia";
import { forgetGoneUserMedia } from "../cache/media/forgetGoneUserMedia";
import { updateCachedUserMedia } from "../cache/media/updateCachedUserMedia";

type Rollback = Partial<UserMediaDto> | null;

/**
 * Une cellule de la ligne d'un média (cellKey, ex. « comment ») : seuls les champs modifiés partent ; « Vu » ainsi que sur
 * un film. Une seule modification à la fois par cellule ; celles d'une même ligne partent dans l'ordre
 */
export function useUpdateUserMedia(userMediaId: number, cellKey: string) {
	return useOptimisticMutation<
		UpdateUserMedia,
		UpdateUserMediaBodyDto,
		Rollback
	>({
		mutationKey: backlogQueryKeys.mutation(
			"updateUserMedia",
			userMediaId,
			cellKey,
		),
		scope: `userMedia-${userMediaId}`,
		actionLabel: "modifier le média",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId`,
			method: HttpMethodEnum.PATCH,
			protected: true,
			pathParams: { userMediaId },
			body,
		}),
		getAffectedQueryKeys: () => [backlogQueryKeys.userMediaLists()],
		// La réponse du serveur porte la ligne à jour : le tableau garde son ordre
		getResyncQueryKeys: () => [],
		applyOptimistic: (queryClient, body) => {
			const current = findCachedUserMedia(queryClient, userMediaId);
			if (current === null) return null;
			const patch = Object.fromEntries(
				Object.entries(body).filter(([, value]) => value !== undefined),
			) as Partial<UserMediaDto>;
			const previous = Object.fromEntries(
				Object.keys(patch).map((field) => [
					field,
					current[field as keyof UserMediaDto],
				]),
			) as Partial<UserMediaDto>;
			updateCachedUserMedia(queryClient, userMediaId, (userMedia) => ({
				...userMedia,
				...patch,
			}));
			return previous;
		},
		revertOptimistic: (queryClient, _body, previous) => {
			if (previous !== null)
				updateCachedUserMedia(queryClient, userMediaId, (userMedia) => ({
					...userMedia,
					...previous,
				}));
		},
		applyServerResponse: (queryClient, userMedia) =>
			updateCachedUserMedia(queryClient, userMediaId, () => userMedia),
		removeGoneResource: (queryClient, _body, error) =>
			forgetGoneUserMedia(queryClient, error, userMediaId),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}

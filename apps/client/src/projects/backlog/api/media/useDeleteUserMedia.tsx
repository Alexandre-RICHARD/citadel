import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import type { DeleteUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/deleteUserMedia/deleteUserMediaEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { forgetGoneUserMedia } from "../cache/media/forgetGoneUserMedia";
import { removeCachedUserMedia } from "../cache/media/removeCachedUserMedia";
import { restoreCachedUserMedia } from "../cache/media/restoreCachedUserMedia";
import type { RemovedUserGamePosition } from "../cache/removedUserGamePosition.type";

type Rollback = {
	userMedia: UserMediaDto;
	positions: RemovedUserGamePosition[];
} | null;

// « Retirer du backlog » : la personnalisation et les épisodes vus partent ; le film ou la série reste en base
export function useDeleteUserMedia(userMediaId: number) {
	return useOptimisticMutation<DeleteUserMedia, void, Rollback>({
		mutationKey: backlogQueryKeys.mutation("deleteUserMedia", userMediaId),
		scope: `userMedia-${userMediaId}`,
		actionLabel: "retirer le média du backlog",
		buildRequest: () => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId`,
			method: HttpMethodEnum.DELETE,
			protected: true,
			pathParams: { userMediaId },
		}),
		// Une saga sans autre média disparaît, et les médias qui la suivaient gardent leur numéro
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userMediaLists(),
			backlogQueryKeys.sagas(),
			backlogQueryKeys.sagaEntriesOfAll(),
			backlogQueryKeys.tmdbSearches(),
		],
		applyOptimistic: (queryClient) =>
			removeCachedUserMedia(queryClient, userMediaId),
		revertOptimistic: (queryClient, _variables, removed) => {
			if (removed !== null)
				restoreCachedUserMedia(
					queryClient,
					removed.userMedia,
					removed.positions,
				);
		},
		removeGoneResource: (queryClient, _variables, error) =>
			forgetGoneUserMedia(queryClient, error, userMediaId),
		errorReasons: backlogErrorReasons,
	});
}

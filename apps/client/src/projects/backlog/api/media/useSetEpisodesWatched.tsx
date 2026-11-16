import type { SetEpisodesWatchedBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/setEpisodesWatched/setEpisodesWatchedBodyDto.type";
import type { SetEpisodesWatched } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/setEpisodesWatched/setEpisodesWatchedEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import type { QueryClient } from "@tanstack/react-query";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { forgetGoneUserMedia } from "../cache/media/forgetGoneUserMedia";
import { setCachedEpisodesWatched } from "../cache/media/setCachedEpisodesWatched";
import { summarizeCachedShow } from "../cache/media/summarizeCachedShow";
import { updateCachedUserMedia } from "../cache/media/updateCachedUserMedia";

// Les épisodes que la mutation a vraiment changés : l'opération inverse ne touche qu'eux
type Rollback = { changedIds: number[] };

// La ligne de la série suit ses saisons en cache : « 12 / 26 », vue, durée
function syncShowRow(queryClient: QueryClient, userMediaId: number): void {
	const progress = summarizeCachedShow(queryClient, userMediaId);
	if (progress !== null)
		updateCachedUserMedia(queryClient, userMediaId, (userMedia) => ({
			...userMedia,
			isWatched: progress.isWatched,
			watchedEpisodeCount: progress.watchedEpisodeCount,
			airedEpisodeCount: progress.airedEpisodeCount,
		}));
}

/**
 * Cases « Vu » d'une série : un épisode, ou une cascade déjà confirmée (saison, série, épisodes précédents ou suivants).
 * Les cases et la ligne de la série suivent tout de suite ; la réponse porte la ligne recalculée par le serveur
 */
export function useSetEpisodesWatched(userMediaId: number) {
	return useOptimisticMutation<
		SetEpisodesWatched,
		SetEpisodesWatchedBodyDto,
		Rollback
	>({
		mutationKey: backlogQueryKeys.mutation("setEpisodesWatched", userMediaId),
		scope: `userMedia-${userMediaId}`,
		actionLabel: "cocher les épisodes vus",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId/watched-episodes`,
			method: HttpMethodEnum.PUT,
			protected: true,
			pathParams: { userMediaId },
			body,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userMediaLists(),
			backlogQueryKeys.showSeasons(userMediaId),
		],
		getResyncQueryKeys: () => [],
		applyOptimistic: (queryClient, { episodeIds, isWatched }) => {
			const changedIds = setCachedEpisodesWatched(
				queryClient,
				userMediaId,
				episodeIds,
				isWatched,
			);
			syncShowRow(queryClient, userMediaId);
			return { changedIds };
		},
		revertOptimistic: (queryClient, { isWatched }, { changedIds }) => {
			setCachedEpisodesWatched(
				queryClient,
				userMediaId,
				changedIds,
				!isWatched,
			);
			syncShowRow(queryClient, userMediaId);
		},
		applyServerResponse: (queryClient, userMedia) =>
			updateCachedUserMedia(queryClient, userMediaId, () => userMedia),
		removeGoneResource: (queryClient, _body, error) =>
			forgetGoneUserMedia(queryClient, error, userMediaId),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}

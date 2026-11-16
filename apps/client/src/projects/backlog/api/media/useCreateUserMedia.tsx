import { getTodayIsoDate } from "@citadel/common/src/universal/date/getTodayIsoDate";
import type { CreateUserMediaBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/createUserMedia/createUserMediaBodyDto.type";
import type { CreateUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/createUserMedia/createUserMediaEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { createTemporaryId } from "../../../../common/api/mutation/createTemporaryId";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { buildOptimisticUserMedia } from "../cache/media/buildOptimisticUserMedia";
import { getCachedSagaEntries } from "../cache/media/getCachedSagaEntries";
import { getCachedSagas } from "../cache/media/getCachedSagas";
import { insertCachedUserMedia } from "../cache/media/insertCachedUserMedia";
import { removeCachedUserMedia } from "../cache/media/removeCachedUserMedia";
import { resolveOptimisticSaga } from "../cache/media/resolveOptimisticSaga";
import { updateCachedUserMedia } from "../cache/media/updateCachedUserMedia";
import type { MediaPreviewFm } from "../model/media/mediaPreviewFm.type";

// La ligne provisoire : la réponse du serveur la remplace, un échec la retire
type Rollback = { temporaryId: number };

/**
 * « Ajouter au backlog » depuis la fiche TMDB : la ligne apparaît en tête du tableau, grisée, construite depuis la fiche ;
 * le serveur lit le média sur TMDB s'il n'est pas en base, puis le range dans sa saga
 */
export function useCreateUserMedia(preview: MediaPreviewFm) {
	return useOptimisticMutation<
		CreateUserMedia,
		CreateUserMediaBodyDto,
		Rollback
	>({
		mutationKey: backlogQueryKeys.mutation(
			"createUserMedia",
			preview.mediaType,
			preview.tmdbId,
		),
		actionLabel: "ajouter le média au backlog",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-media`,
			method: HttpMethodEnum.POST,
			protected: true,
			body,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userMediaLists(),
			backlogQueryKeys.sagas(),
			backlogQueryKeys.sagaEntriesOfAll(),
			backlogQueryKeys.tmdbSearches(),
			backlogQueryKeys.mediaPreview(preview.mediaType, preview.tmdbId),
		],
		applyOptimistic: (queryClient, { customization }) => {
			const temporaryId = createTemporaryId();
			const saga = resolveOptimisticSaga(
				customization.saga,
				preview.proposedSaga,
				getCachedSagas(queryClient),
				createTemporaryId(),
			);
			insertCachedUserMedia(
				queryClient,
				buildOptimisticUserMedia({
					id: temporaryId,
					preview,
					imagePath: customization.imagePath,
					saga,
					sagaNumber: customization.sagaNumber,
					sagaEntries:
						saga === null ? [] : getCachedSagaEntries(queryClient, saga.id),
					now: new Date().toISOString(),
					today: getTodayIsoDate(),
				}),
			);
			return { temporaryId };
		},
		revertOptimistic: (queryClient, _body, { temporaryId }) => {
			removeCachedUserMedia(queryClient, temporaryId);
		},
		applyServerResponse: (queryClient, userMedia, _body, { temporaryId }) =>
			updateCachedUserMedia(queryClient, temporaryId, () => userMedia),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}

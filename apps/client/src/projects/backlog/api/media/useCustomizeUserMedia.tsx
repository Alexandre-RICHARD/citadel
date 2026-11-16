import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import type { CustomizeUserMediaBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/customizeUserMedia/customizeUserMediaBodyDto.type";
import type { CustomizeUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/customizeUserMedia/customizeUserMediaEndpoint.interface";
import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/formatSeriesNumber";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { createTemporaryId } from "../../../../common/api/mutation/createTemporaryId";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { findCachedUserMedia } from "../cache/media/findCachedUserMedia";
import { forgetGoneUserMedia } from "../cache/media/forgetGoneUserMedia";
import { getCachedSagaEntries } from "../cache/media/getCachedSagaEntries";
import { getCachedSagas } from "../cache/media/getCachedSagas";
import { resolveOptimisticSaga } from "../cache/media/resolveOptimisticSaga";
import { updateCachedUserMedia } from "../cache/media/updateCachedUserMedia";

type Customization = Pick<
	UserMediaDto,
	"imagePath" | "saga" | "sagaNumber" | "sagaNumberLabel"
>;
type Rollback = Customization | null;

/**
 * « Personnaliser » : miniature, saga et numéro. La ligne change tout de suite ; les numéros des autres médias de la saga,
 * que le serveur décale, se resynchronisent après, avec la liste des sagas
 */
export function useCustomizeUserMedia(userMediaId: number) {
	return useOptimisticMutation<
		CustomizeUserMedia,
		CustomizeUserMediaBodyDto,
		Rollback
	>({
		mutationKey: backlogQueryKeys.mutation("customizeUserMedia", userMediaId),
		scope: `userMedia-${userMediaId}`,
		actionLabel: "personnaliser le média",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId`,
			method: HttpMethodEnum.PUT,
			protected: true,
			pathParams: { userMediaId },
			body,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userMediaLists(),
			backlogQueryKeys.sagas(),
			backlogQueryKeys.sagaEntriesOfAll(),
		],
		applyOptimistic: (queryClient, body) => {
			const current = findCachedUserMedia(queryClient, userMediaId);
			if (current === null) return null;
			// « Personnaliser » ne propose pas la saga de la collection TMDB : la saga actuelle est une saga du compte
			const saga = resolveOptimisticSaga(
				body.saga,
				null,
				getCachedSagas(queryClient),
				createTemporaryId(),
			);
			const sagaNumber =
				saga === null ? null : (body.sagaNumber ?? current.sagaNumber);
			updateCachedUserMedia(queryClient, userMediaId, (userMedia) => ({
				...userMedia,
				imagePath: body.imagePath,
				saga,
				sagaNumber,
				sagaNumberLabel:
					saga === null || sagaNumber === null
						? null
						: formatSeriesNumber(
								sagaNumber,
								getCachedSagaEntries(queryClient, saga.id),
							),
			}));
			return {
				imagePath: current.imagePath,
				saga: current.saga,
				sagaNumber: current.sagaNumber,
				sagaNumberLabel: current.sagaNumberLabel,
			};
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

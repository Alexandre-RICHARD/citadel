import type { SagaEntryListDto } from "@citadel/specs/src/projects/backlog/dto/saga/sagaEntryListDto.type";
import type { ReorderSagaBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/sagas/reorderSaga/reorderSagaBodyDto.type";
import type { ReorderSaga } from "@citadel/specs/src/projects/backlog/endpoint/sagas/reorderSaga/reorderSagaEndpoint.interface";
import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/formatSeriesNumber";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import type { QueryClient } from "@tanstack/react-query";

import { updateCachedQueryData } from "../../../../common/api/cache/updateCachedQueryData";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { getCachedSagaEntries } from "../cache/media/getCachedSagaEntries";
import { updateCachedUserMedia } from "../cache/media/updateCachedUserMedia";

type Rollback = { previousNumbers: Map<number, number> };

// Pose des numéros sur les médias de la saga : dans la liste de la saga, et sur leurs lignes du tableau
function applyNumbers(
	queryClient: QueryClient,
	sagaId: number,
	numbers: Map<number, number>,
): void {
	updateCachedQueryData<SagaEntryListDto>(
		queryClient,
		backlogQueryKeys.sagaEntries(sagaId),
		(data) => ({
			entries: data.entries.map((entry) => ({
				...entry,
				sagaNumber: numbers.get(entry.userMediaId) ?? entry.sagaNumber,
			})),
		}),
	);
	const entries = [...numbers].map(([gameId, seriesNumber]) => ({
		gameId,
		seriesNumber,
	}));
	for (const { gameId, seriesNumber } of entries)
		updateCachedUserMedia(queryClient, gameId, (userMedia) => ({
			...userMedia,
			sagaNumber: seriesNumber,
			sagaNumberLabel: formatSeriesNumber(seriesNumber, entries),
		}));
}

// « Valider » de « Réorganiser la saga » : tous les nouveaux numéros, en une seule action
export function useReorderSaga(sagaId: number) {
	return useOptimisticMutation<ReorderSaga, ReorderSagaBodyDto, Rollback>({
		mutationKey: backlogQueryKeys.mutation("reorderSaga", sagaId),
		actionLabel: "réorganiser la saga",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/sagas/:sagaId/entries`,
			method: HttpMethodEnum.PUT,
			protected: true,
			pathParams: { sagaId },
			body,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userMediaLists(),
			backlogQueryKeys.sagaEntries(sagaId),
		],
		applyOptimistic: (queryClient, { entries }) => {
			const previousNumbers = new Map(
				getCachedSagaEntries(queryClient, sagaId).map(
					({ gameId, seriesNumber }) => [gameId, seriesNumber],
				),
			);
			applyNumbers(
				queryClient,
				sagaId,
				new Map(
					entries.map(({ userMediaId, sagaNumber }) => [
						userMediaId,
						sagaNumber,
					]),
				),
			);
			return { previousNumbers };
		},
		revertOptimistic: (queryClient, _body, { previousNumbers }) =>
			applyNumbers(queryClient, sagaId, previousNumbers),
		applyServerResponse: (queryClient, entryList) =>
			queryClient.setQueryData(backlogQueryKeys.sagaEntries(sagaId), entryList),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}

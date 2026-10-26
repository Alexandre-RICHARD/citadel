import type { ReorderSeriesBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/series/reorderSeries/reorderSeriesBodyDto.type";
import type { ReorderSeries } from "@citadel/specs/src/projects/backlog/endpoint/series/reorderSeries/reorderSeriesEndpoint.interface";
import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/formatSeriesNumber";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { getCachedSeriesEntries } from "../cache/getCachedSeriesEntries";
import { updateCachedSeriesEntries } from "../cache/updateCachedSeriesEntries";
import { updateCachedUserGame } from "../cache/updateCachedUserGame";

type Rollback = { previousNumbers: Map<number, number> };

// Pose des numéros sur les jeux de la série : dans la liste de la série, et sur leurs lignes du tableau
function applyNumbers(
	queryClient: Parameters<typeof updateCachedUserGame>[0],
	seriesId: number,
	numbers: Map<number, number>,
): void {
	updateCachedSeriesEntries(queryClient, seriesId, (entries) =>
		entries
			.map((entry) => ({
				...entry,
				seriesNumber: numbers.get(entry.gameId) ?? entry.seriesNumber,
			}))
			.toSorted((first, second) => first.seriesNumber - second.seriesNumber),
	);
	const entries = [...numbers].map(([gameId, seriesNumber]) => ({
		gameId,
		seriesNumber,
	}));
	for (const { gameId, seriesNumber } of entries)
		updateCachedUserGame(queryClient, gameId, (userGame) => ({
			...userGame,
			seriesNumber,
			seriesNumberLabel: formatSeriesNumber(seriesNumber, entries),
		}));
}

// « Valider » de « Réorganiser la série » : tous les nouveaux numéros, en une seule action
export function useReorderSeries(seriesId: number) {
	return useOptimisticMutation<ReorderSeries, ReorderSeriesBodyDto, Rollback>({
		mutationKey: backlogQueryKeys.mutation("reorderSeries", seriesId),
		actionLabel: "réorganiser la série",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/series/:seriesId/entries`,
			method: HttpMethodEnum.PUT,
			protected: false,
			pathParams: { seriesId },
			body,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userGames(),
			backlogQueryKeys.seriesEntries(seriesId),
		],
		applyOptimistic: (queryClient, { entries }) => {
			const previousNumbers = new Map(
				getCachedSeriesEntries(queryClient, seriesId).map(
					({ gameId, seriesNumber }) => [gameId, seriesNumber],
				),
			);
			applyNumbers(
				queryClient,
				seriesId,
				new Map(
					entries.map(({ gameId, seriesNumber }) => [gameId, seriesNumber]),
				),
			);
			return { previousNumbers };
		},
		revertOptimistic: (queryClient, _body, { previousNumbers }) =>
			applyNumbers(queryClient, seriesId, previousNumbers),
		applyServerResponse: (queryClient, entryList) =>
			queryClient.setQueryData(
				backlogQueryKeys.seriesEntries(seriesId),
				entryList,
			),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}

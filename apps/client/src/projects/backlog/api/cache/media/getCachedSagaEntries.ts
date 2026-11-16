import type { SagaEntryListDto } from "@citadel/specs/src/projects/backlog/dto/saga/sagaEntryListDto.type";
import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/seriesEntry.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../../backlogQueryKeys";

// Les numéros d'une saga en cache, au format des séries des jeux (`gameId` : la ligne du média) ; vide s'ils ne sont pas lus
export function getCachedSagaEntries(
	queryClient: QueryClient,
	sagaId: number,
): SeriesEntry[] {
	return (
		queryClient
			.getQueryData<SagaEntryListDto>(backlogQueryKeys.sagaEntries(sagaId))
			?.entries.map(({ userMediaId, sagaNumber }) => ({
				gameId: userMediaId,
				seriesNumber: sagaNumber,
			})) ?? []
	);
}

import type { SeriesEntryDto } from "@citadel/specs/src/projects/backlog/dto/series/seriesEntryDto.type";
import type { SeriesEntryListDto } from "@citadel/specs/src/projects/backlog/dto/series/seriesEntryListDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";

// Les jeux d'une série, s'ils ont été lus
export function updateCachedSeriesEntries(
	queryClient: QueryClient,
	seriesId: number,
	update: (entries: SeriesEntryDto[]) => SeriesEntryDto[],
): void {
	queryClient.setQueryData<SeriesEntryListDto | null>(
		backlogQueryKeys.seriesEntries(seriesId),
		(data) =>
			data === undefined ? undefined : { entries: update(data?.entries ?? []) },
	);
}

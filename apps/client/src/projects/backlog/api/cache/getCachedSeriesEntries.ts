import type { SeriesEntryDto } from "@citadel/specs/src/projects/backlog/dto/series/seriesEntryDto.type";
import type { SeriesEntryListDto } from "@citadel/specs/src/projects/backlog/dto/series/seriesEntryListDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";

// Les jeux d'une série s'ils ont été lus ; une série sans jeu du backlog (204) en a aucun
export function getCachedSeriesEntries(
	queryClient: QueryClient,
	seriesId: number,
): SeriesEntryDto[] {
	return (
		queryClient.getQueryData<SeriesEntryListDto | null>(
			backlogQueryKeys.seriesEntries(seriesId),
		)?.entries ?? []
	);
}

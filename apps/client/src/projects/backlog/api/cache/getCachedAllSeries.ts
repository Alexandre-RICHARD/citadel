import type { SeriesDto } from "@citadel/specs/src/projects/backlog/dto/common/seriesDto.type";
import type { SeriesListDto } from "@citadel/specs/src/projects/backlog/dto/series/seriesListDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";

// Les séries de la base, si elles ont été lues ; une liste vide (204) en a aucune
export function getCachedAllSeries(queryClient: QueryClient): SeriesDto[] {
	return (
		queryClient.getQueryData<SeriesListDto | null>(backlogQueryKeys.allSeries())
			?.series ?? []
	);
}

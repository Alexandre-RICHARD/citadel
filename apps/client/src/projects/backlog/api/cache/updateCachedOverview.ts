import type { BacklogOverviewDto } from "@citadel/specs/src/projects/backlog/dto/overview/backlogOverviewDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";

// Les compteurs du haut de page, s'ils ont été lus
export function updateCachedOverview(
	queryClient: QueryClient,
	update: (overview: BacklogOverviewDto) => BacklogOverviewDto,
): void {
	queryClient.setQueryData<BacklogOverviewDto>(
		backlogQueryKeys.overview(),
		(overview) => (overview === undefined ? undefined : update(overview)),
	);
}

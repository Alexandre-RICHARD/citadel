import type { BacklogOverviewDto } from "@citadel/specs/src/projects/backlog/dto/overview/backlogOverviewDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { updateCachedQueryData } from "../../../../common/api/cache/updateCachedQueryData";
import { backlogQueryKeys } from "../backlogQueryKeys";

// Les compteurs du haut de page, s'ils ont été lus
export function updateCachedOverview(
	queryClient: QueryClient,
	update: (overview: BacklogOverviewDto) => BacklogOverviewDto,
): void {
	updateCachedQueryData(queryClient, backlogQueryKeys.overview(), update);
}

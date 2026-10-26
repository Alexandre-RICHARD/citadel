import { useQuery } from "@tanstack/react-query";

import type { BacklogOverviewFm } from "../model/backlogOverviewFm.type";
import { overviewQueryOptions } from "./overviewQueryOptions";

// Haut de page, hors de toute zone : null tant qu'il n'est pas chargé, sans suspendre ni lever d'erreur
export function useBacklogOverview(): BacklogOverviewFm | null {
	return useQuery(overviewQueryOptions).data ?? null;
}

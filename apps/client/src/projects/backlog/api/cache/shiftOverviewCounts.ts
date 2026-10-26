import type { QueryClient } from "@tanstack/react-query";

import { updateCachedOverview } from "./updateCachedOverview";

type CountShifts = {
	gameCount?: number;
	userVersionCount?: number;
	outsideBacklogGameCount?: number;
};

// Les compteurs suivent un ajout ou un retrait, et l'inverse en cas d'échec ; un compteur ne descend pas sous zéro
export function shiftOverviewCounts(
	queryClient: QueryClient,
	shifts: CountShifts,
): void {
	updateCachedOverview(queryClient, (overview) => ({
		...overview,
		gameCount: Math.max(0, overview.gameCount + (shifts.gameCount ?? 0)),
		userVersionCount: Math.max(
			0,
			overview.userVersionCount + (shifts.userVersionCount ?? 0),
		),
		outsideBacklogGameCount: Math.max(
			0,
			overview.outsideBacklogGameCount + (shifts.outsideBacklogGameCount ?? 0),
		),
	}));
}

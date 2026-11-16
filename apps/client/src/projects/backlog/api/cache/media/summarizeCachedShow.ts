import { getTodayIsoDate } from "@citadel/common/src/universal/date/getTodayIsoDate";
import type { ShowSeasonListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/showSeasonListDto.type";
import type { ShowProgress } from "@citadel/specs/src/projects/backlog/helper/media/showProgress.type";
import { summarizeShowProgress } from "@citadel/specs/src/projects/backlog/helper/media/summarizeShowProgress";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../../backlogQueryKeys";

// La progression d'une série d'après ses saisons en cache, la même règle que le serveur ; null si elles ne sont pas lues
export function summarizeCachedShow(
	queryClient: QueryClient,
	userMediaId: number,
): ShowProgress | null {
	const data = queryClient.getQueryData<ShowSeasonListDto | null>(
		backlogQueryKeys.showSeasons(userMediaId),
	);
	if (data === undefined || data === null) return null;
	return summarizeShowProgress(
		data.seasons.flatMap(({ seasonNumber, episodes }) =>
			episodes.map(({ airDate, runtimeMinutes, isWatched }) => ({
				seasonNumber,
				airDate,
				runtimeMinutes,
				isWatched,
			})),
		),
		getTodayIsoDate(),
	);
}

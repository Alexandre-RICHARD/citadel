import type { ShowSeasonListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/showSeasonListDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { updateCachedQueryData } from "../../../../../common/api/cache/updateCachedQueryData";
import { backlogQueryKeys } from "../../backlogQueryKeys";

/**
 * Coche ou décoche des épisodes dans les saisons en cache d'une série ; rend ceux qui ont vraiment changé, pour que
 * l'opération inverse ne touche qu'eux (et pas ceux qu'une autre mutation en cours a déjà changés)
 */
export function setCachedEpisodesWatched(
	queryClient: QueryClient,
	userMediaId: number,
	episodeIds: number[],
	isWatched: boolean,
): number[] {
	const changedIds: number[] = [];
	updateCachedQueryData<ShowSeasonListDto | null>(
		queryClient,
		backlogQueryKeys.showSeasons(userMediaId),
		(data) =>
			data === null
				? null
				: {
						seasons: data.seasons.map((season) => ({
							...season,
							episodes: season.episodes.map((episode) => {
								if (
									!episodeIds.includes(episode.id) ||
									episode.isWatched === isWatched
								)
									return episode;
								changedIds.push(episode.id);
								return { ...episode, isWatched };
							}),
						})),
					},
	);
	return changedIds;
}

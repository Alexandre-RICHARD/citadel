import type { ShowSeasonListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/showSeasonListDto.type";
import { isAiredEpisode } from "@citadel/specs/src/projects/backlog/helper/media/isAiredEpisode";

import type { ShowEpisodeFm } from "./showEpisodeFm.type";
import type { ShowSeasonFm } from "./showSeasonFm.type";

// La saison 0 réunit les épisodes spéciaux
const SPECIALS_SEASON_NUMBER = 0;

function sumRuntimes(episodes: ShowEpisodeFm[]): number | null {
	const runtimes = episodes.flatMap(({ runtimeMinutes }) =>
		runtimeMinutes === null ? [] : [runtimeMinutes],
	);
	return runtimes.length === 0
		? null
		: runtimes.reduce((total, runtime) => total + runtime, 0);
}

/**
 * Saisons d'une série → sous-lignes, chacune avec sa progression : comme celle de la série (summarizeShowProgress), sur ses
 * seuls épisodes diffusés à `today` (AAAA-MM-JJ). Une réponse vide (un film) n'en a aucune
 */
export function fromShowSeasonListDtoToShowSeasonsFm(
	data: ShowSeasonListDto | null,
	today: string,
): ShowSeasonFm[] {
	return (data?.seasons ?? []).map((season) => {
		const episodes = season.episodes.map((episode): ShowEpisodeFm => ({
			episodeId: episode.id,
			episodeNumber: episode.episodeNumber,
			name: episode.name,
			airDate: episode.airDate,
			runtimeMinutes: episode.runtimeMinutes,
			stillPath: episode.stillPath,
			isWatched: episode.isWatched,
			isAired: isAiredEpisode(episode.airDate, today),
		}));
		const aired = episodes.filter(({ isAired }) => isAired);
		const watchedEpisodeCount = aired.filter(
			({ isWatched }) => isWatched,
		).length;
		return {
			seasonId: season.id,
			seasonNumber: season.seasonNumber,
			name: season.name,
			isSpecials: season.seasonNumber === SPECIALS_SEASON_NUMBER,
			airDate: season.airDate,
			posterPath: season.posterPath,
			runtimeMinutes: sumRuntimes(episodes),
			watchedEpisodeCount,
			airedEpisodeCount: aired.length,
			isWatched: aired.length > 0 && watchedEpisodeCount === aired.length,
			episodes,
		};
	});
}

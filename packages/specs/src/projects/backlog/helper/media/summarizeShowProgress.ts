import { isAiredEpisode } from "./isAiredEpisode.ts";
import type { ShowEpisodeState } from "./showEpisodeState.type.ts";
import type { ShowProgress } from "./showProgress.type.ts";

// La saison 0 réunit les épisodes spéciaux, hors des saisons principales et de la progression
const SPECIALS_SEASON_NUMBER = 0;

/**
 * Progression d'une série (ou d'une saison, avec ses seuls épisodes) : les épisodes spéciaux et ceux pas encore
 * diffusés n'y comptent pas. Vue quand tous ses épisodes diffusés le sont ; une série sans épisode diffusé n'est pas
 * vue. Durée : la somme des durées connues de ses épisodes principaux, null si aucune ne l'est
 */
export function summarizeShowProgress(
	episodes: ShowEpisodeState[],
	today: string,
): ShowProgress {
	const mainEpisodes = episodes.filter(
		({ seasonNumber }) => seasonNumber !== SPECIALS_SEASON_NUMBER,
	);
	const aired = mainEpisodes.filter(({ airDate }) =>
		isAiredEpisode(airDate, today),
	);
	const watchedEpisodeCount = aired.filter(({ isWatched }) => isWatched).length;
	const runtimes = mainEpisodes
		.map(({ runtimeMinutes }) => runtimeMinutes)
		.filter((runtime) => runtime !== null);
	return {
		watchedEpisodeCount,
		airedEpisodeCount: aired.length,
		runtimeMinutes:
			runtimes.length === 0
				? null
				: runtimes.reduce((total, runtime) => total + runtime, 0),
		isWatched: aired.length > 0 && watchedEpisodeCount === aired.length,
	};
}

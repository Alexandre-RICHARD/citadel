import type { ShowEpisodeFm } from "../../api/model/media/showEpisodeFm.type";
import type { ShowSeasonFm } from "../../api/model/media/showSeasonFm.type";
import type { WatchedChange } from "./watchedChange.type";
import type { WatchedPlan } from "./watchedPlan.type";
import type { WatchedTarget } from "./watchedTarget.type";

// Une série ou une saison : cochée, ses épisodes diffusés pas encore vus le deviennent ; vue, tous ses épisodes vus se décochent
function planGroup(
	episodes: ShowEpisodeFm[],
	isWatched: boolean,
): WatchedPlan | null {
	const nextIsWatched = !isWatched;
	const episodeIds = episodes
		.filter((episode) =>
			nextIsWatched ? episode.isAired && !episode.isWatched : episode.isWatched,
		)
		.map(({ episodeId }) => episodeId);
	if (episodeIds.length === 0) return null;
	const change = { episodeIds, isWatched: nextIsWatched };
	return episodeIds.length === 1
		? { kind: "direct", change }
		: { kind: "cascade", change };
}

/**
 * Un épisode d'une saison principale : le cocher propose de cocher aussi les épisodes diffusés précédents pas encore vus,
 * le décocher propose de décocher aussi les suivants vus, dans l'ordre de la série. Un épisode spécial change seul
 */
function planEpisode(
	seasons: ShowSeasonFm[],
	episodeId: number,
): WatchedPlan | null {
	const season = seasons.find(({ episodes }) =>
		episodes.some((episode) => episode.episodeId === episodeId),
	);
	const episode = season?.episodes.find(
		(current) => current.episodeId === episodeId,
	);
	if (season === undefined || episode === undefined) return null;
	const change: WatchedChange = {
		episodeIds: [episodeId],
		isWatched: !episode.isWatched,
	};
	if (season.isSpecials) return { kind: "direct", change };

	const mainEpisodes = seasons
		.filter(({ isSpecials }) => !isSpecials)
		.flatMap(({ episodes }) => episodes);
	const index = mainEpisodes.findIndex(
		(current) => current.episodeId === episodeId,
	);
	const extraIds = (
		change.isWatched
			? mainEpisodes
					.slice(0, index)
					.filter(({ isAired, isWatched }) => isAired && !isWatched)
			: mainEpisodes.slice(index + 1).filter(({ isWatched }) => isWatched)
	).map((current) => current.episodeId);
	if (extraIds.length === 0) return { kind: "direct", change };
	return {
		kind: "extend",
		change,
		extended: {
			episodeIds: change.isWatched
				? [...extraIds, episodeId]
				: [episodeId, ...extraIds],
			isWatched: change.isWatched,
		},
	};
}

/**
 * Ce que fait un clic sur une case « Vu » d'une série, d'après ses saisons lues. La série ne porte que ses saisons
 * principales : les épisodes spéciaux restent hors de sa cascade. null : rien à changer (aucun épisode diffusé)
 */
export function planWatchedChange(
	seasons: ShowSeasonFm[],
	target: WatchedTarget,
	isShowWatched: boolean,
): WatchedPlan | null {
	switch (target.kind) {
		case "show":
			return planGroup(
				seasons
					.filter(({ isSpecials }) => !isSpecials)
					.flatMap(({ episodes }) => episodes),
				isShowWatched,
			);
		case "season": {
			const season = seasons.find(
				({ seasonId }) => seasonId === target.seasonId,
			);
			return season === undefined
				? null
				: planGroup(season.episodes, season.isWatched);
		}
		default:
			return planEpisode(seasons, target.episodeId);
	}
}

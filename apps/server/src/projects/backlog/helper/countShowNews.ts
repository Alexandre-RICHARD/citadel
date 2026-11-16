import type { TmdbShowData } from "../tmdb/type/tmdbShowData.type.ts";

type StoredShowContent = {
	seasonIds: Set<number>;
	episodeIds: Set<number>;
};

type ShowNews = {
	newSeasonCount: number;
	newEpisodeCount: number;
};

// Ce que la fiche TMDB d'une série apporte à la base : saisons et épisodes qu'elle n'a pas encore
export function countShowNews(
	show: TmdbShowData,
	stored: StoredShowContent,
): ShowNews {
	return {
		newSeasonCount: show.seasons.filter(({ id }) => !stored.seasonIds.has(id))
			.length,
		newEpisodeCount: show.seasons
			.flatMap(({ episodes }) => episodes)
			.filter(({ id }) => !stored.episodeIds.has(id)).length,
	};
}

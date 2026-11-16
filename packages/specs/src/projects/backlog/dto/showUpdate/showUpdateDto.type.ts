// Une série en cours du backlog qui a du nouveau sur TMDB : saisons et épisodes absents de la base
export type ShowUpdateDto = {
	tmdbId: number;
	title: string;
	newSeasonCount: number;
	newEpisodeCount: number;
};

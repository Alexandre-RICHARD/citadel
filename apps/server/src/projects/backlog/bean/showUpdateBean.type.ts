// Une série en cours qui a du nouveau sur TMDB : saisons et épisodes absents de la base
export type ShowUpdateBean = {
	tmdbId: number;
	title: string;
	newSeasonCount: number;
	newEpisodeCount: number;
};

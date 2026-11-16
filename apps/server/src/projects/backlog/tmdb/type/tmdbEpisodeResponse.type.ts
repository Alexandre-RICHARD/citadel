// Un épisode, dans la fiche de sa saison sur TMDB
export type TmdbEpisodeResponse = {
	id: number;
	episode_number: number;
	name: string | null;
	air_date: string | null;
	runtime: number | null;
	still_path: string | null;
};

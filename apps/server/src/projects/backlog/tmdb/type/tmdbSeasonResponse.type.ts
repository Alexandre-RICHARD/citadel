import type { TmdbEpisodeResponse } from "./tmdbEpisodeResponse.type.ts";

// Fiche d'une saison sur TMDB (/tv/:id/season/:n, ou ajoutée à la fiche de la série par append_to_response)
export type TmdbSeasonResponse = {
	id: number;
	season_number: number;
	name: string | null;
	air_date: string | null;
	poster_path: string | null;
	episodes: TmdbEpisodeResponse[] | null;
};

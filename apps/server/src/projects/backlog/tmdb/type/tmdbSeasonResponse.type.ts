import type { TmdbEpisodeResponse } from "./tmdbEpisodeResponse.type.ts";

// Fiche d'une saison sur TMDB (/tv/:id/season/:n, ou ajoutée à la fiche de la série par append_to_response). Ajoutée à
// la fiche, elle n'a pas d'identifiant numérique (seulement un `_id` en texte) : il vient de la liste de la série
export type TmdbSeasonResponse = {
	season_number: number;
	name: string | null;
	air_date: string | null;
	poster_path: string | null;
	episodes: TmdbEpisodeResponse[] | null;
};

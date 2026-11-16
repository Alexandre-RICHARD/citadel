import type { TmdbSeasonSummary } from "./tmdbSeasonSummary.type.ts";

// Fiche d'une série sur TMDB (/tv/:id, avec external_ids), réduite à ce que le backlog lit
export type TmdbTvShowResponse = {
	id: number;
	name: string;
	original_name: string;
	original_language: string | null;
	first_air_date: string | null;
	poster_path: string | null;
	status: string | null;
	in_production: boolean | null;
	seasons: TmdbSeasonSummary[] | null;
	external_ids?: { imdb_id: string | null } | null;
};

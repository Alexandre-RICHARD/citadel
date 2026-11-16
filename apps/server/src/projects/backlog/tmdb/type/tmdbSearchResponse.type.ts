import type { TmdbSearchItem } from "./tmdbSearchItem.type.ts";

// La recherche multiple de TMDB (/search/multi), première page
export type TmdbSearchResponse = {
	results: TmdbSearchItem[] | null;
};

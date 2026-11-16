import type { TmdbSearchHit } from "../tmdb/type/tmdbSearchHit.type.ts";

// Un résultat de la recherche TMDB, et sa ligne dans le backlog du compte s'il y est
export type TmdbSearchResultBean = TmdbSearchHit & {
	userMediaId: number | null;
};

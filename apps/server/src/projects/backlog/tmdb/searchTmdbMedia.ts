import { fromTmdbSearchResponse } from "./mapper/fromTmdbSearchResponse.ts";
import { tmdbClient } from "./tmdbClient.ts";
import type { TmdbSearchHit } from "./type/tmdbSearchHit.type.ts";
import type { TmdbSearchResponse } from "./type/tmdbSearchResponse.type.ts";

// Films et séries ensemble, première page de TMDB (20 résultats au plus), sans contenu pour adultes
export async function searchTmdbMedia(query: string): Promise<TmdbSearchHit[]> {
	const response = await tmdbClient.get<TmdbSearchResponse>("/search/multi", {
		query,
		include_adult: "false",
	});
	return response === null ? [] : fromTmdbSearchResponse(response);
}

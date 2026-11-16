import { createExpiringCache } from "@citadel/common/src/universal/cache/createExpiringCache.ts";

import { fetchTmdbMovie } from "./fetchTmdbMovie.ts";
import type { TmdbMovieData } from "./type/tmdbMovieData.type.ts";

// La fiche s'ouvre, puis « Valider » l'enregistre : quelques minutes de cache évitent de la relire sur TMDB
const CACHE_DURATION_MS = 10 * 60_000;
const MAX_CACHED = 200;

const cache = createExpiringCache<number, TmdbMovieData>({
	durationMs: CACHE_DURATION_MS,
	maxEntries: MAX_CACHED,
});

// fetchTmdbMovie, gardé quelques minutes en mémoire
export async function fetchCachedTmdbMovie(
	tmdbId: number,
): Promise<TmdbMovieData | null> {
	const cached = cache.get(tmdbId);
	if (cached !== undefined) return cached;
	const movie = await fetchTmdbMovie(tmdbId);
	if (movie !== null) cache.set([tmdbId], movie);
	return movie;
}

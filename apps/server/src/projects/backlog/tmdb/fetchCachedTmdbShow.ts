import { createExpiringCache } from "@citadel/common/src/universal/cache/createExpiringCache.ts";

import { fetchTmdbShow } from "./fetchTmdbShow.ts";
import type { TmdbShowData } from "./type/tmdbShowData.type.ts";

// La fiche s'ouvre, puis « Valider » l'enregistre : quelques minutes de cache évitent de la relire sur TMDB
const CACHE_DURATION_MS = 10 * 60_000;
const MAX_CACHED = 200;

const cache = createExpiringCache<number, TmdbShowData>({
	durationMs: CACHE_DURATION_MS,
	maxEntries: MAX_CACHED,
});

// fetchTmdbShow, gardé quelques minutes en mémoire
export async function fetchCachedTmdbShow(
	tmdbId: number,
): Promise<TmdbShowData | null> {
	const cached = cache.get(tmdbId);
	if (cached !== undefined) return cached;
	const show = await fetchTmdbShow(tmdbId);
	if (show !== null) cache.set([tmdbId], show);
	return show;
}

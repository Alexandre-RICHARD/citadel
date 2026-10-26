import { fetchIgdbGameData } from "./fetchIgdbGameData.ts";
import type { IgdbGameData } from "./type/igdbGameData.type.ts";

// La modale du jeu lit la fiche, puis « Valider » la relit pour l'enregistrer : sans cache, deux fois une dizaine de
// requêtes à 4 par seconde. Quelques minutes suffisent entre l'ouverture et la validation
const CACHE_DURATION_MS = 10 * 60_000;
const MAX_CACHED_GAMES = 200;

type CacheEntry = {
	data: IgdbGameData;
	expiresAt: number;
};

// Clé : la fiche demandée et l'id de son original, qui mènent aux mêmes données
const cache = new Map<number, CacheEntry>();

function forgetExpired(now: number): void {
	for (const [igdbId, entry] of cache)
		if (entry.expiresAt <= now) cache.delete(igdbId);
	// Au-delà, les plus anciennes partent les premières (une Map garde l'ordre d'ajout)
	for (const igdbId of [...cache.keys()].slice(
		0,
		Math.max(0, cache.size - MAX_CACHED_GAMES),
	))
		cache.delete(igdbId);
}

// fetchIgdbGameData, gardé quelques minutes en mémoire
export async function fetchCachedIgdbGameData(
	igdbId: number,
): Promise<IgdbGameData | null> {
	const now = Date.now();
	const cached = cache.get(igdbId);
	if (cached && cached.expiresAt > now) return cached.data;

	const data = await fetchIgdbGameData(igdbId);
	if (data !== null) {
		const entry = { data, expiresAt: now + CACHE_DURATION_MS };
		cache.set(igdbId, entry);
		cache.set(data.original.id, entry);
		forgetExpired(now);
	}
	return data;
}

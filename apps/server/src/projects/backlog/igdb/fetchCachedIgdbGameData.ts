import { createExpiringCache } from "@citadel/common/src/universal/cache/createExpiringCache.ts";

import { fetchIgdbGameData } from "./fetchIgdbGameData.ts";
import type { IgdbGameData } from "./type/igdbGameData.type.ts";

// La modale du jeu lit la fiche, puis « Valider » la relit pour l'enregistrer : sans cache, deux fois une dizaine de
// requêtes à 4 par seconde. Quelques minutes suffisent entre l'ouverture et la validation
const CACHE_DURATION_MS = 10 * 60_000;
const MAX_CACHED_GAMES = 200;

// Clé : la fiche demandée et l'id de son original, qui mènent aux mêmes données
const cache = createExpiringCache<number, IgdbGameData>({
	durationMs: CACHE_DURATION_MS,
	maxEntries: MAX_CACHED_GAMES,
});

// fetchIgdbGameData, gardé quelques minutes en mémoire
export async function fetchCachedIgdbGameData(
	igdbId: number,
): Promise<IgdbGameData | null> {
	const cached = cache.get(igdbId);
	if (cached !== undefined) return cached;

	const data = await fetchIgdbGameData(igdbId);
	if (data !== null) cache.set([igdbId, data.original.id], data);
	return data;
}

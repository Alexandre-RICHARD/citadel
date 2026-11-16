const SECOND_MS = 1000;

/**
 * Attente avant de rejouer une requête refusée par TMDB (429, trop de requêtes) : ce que dit son en-tête Retry-After
 * (en secondes), sinon 1 s, 2 s, 4 s… selon l'essai
 */
export function getTmdbRetryDelayMs(
	retryAfter: string | null,
	attempt: number,
): number {
	const seconds = Number(retryAfter);
	if (retryAfter !== null && Number.isFinite(seconds) && seconds > 0)
		return seconds * SECOND_MS;
	return SECOND_MS * 2 ** (attempt - 1);
}

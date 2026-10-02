/**
 * Délai avant une nouvelle tentative, en millisecondes : baseDelay × factor^attempt, plafonné à maxDelay.
 * `attempt` commence à 0 pour la première nouvelle tentative, comme le failureCount de TanStack Query.
 * `baseDelay` et `maxDelay` sont en secondes
 */
export function exponentialInterval(
	baseDelay: number,
	attempt: number,
	factor = 2,
	maxDelay?: number,
): number {
	const calculatedDelay = baseDelay * factor ** attempt * 1_000;

	if (maxDelay === undefined) return calculatedDelay;
	return Math.min(calculatedDelay, maxDelay * 1_000);
}

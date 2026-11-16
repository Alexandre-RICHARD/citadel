/**
 * L'écart avec le passage précédent : « +12 », « −2 » (vrai signe moins) ; null quand il n'y a rien à comparer (premier
 * passage) ou rien de changé
 */
export function formatDelta(
	current: number,
	previous: number | null,
): string | null {
	if (previous === null || current === previous) return null;
	const difference = current - previous;
	return difference > 0 ? `+${difference}` : `−${-difference}`;
}

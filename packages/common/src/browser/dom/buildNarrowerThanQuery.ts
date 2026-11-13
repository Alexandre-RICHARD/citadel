// La media query « fenêtre plus étroite que `widthPx` » : `widthPx` lui-même n'en fait pas partie (768 → jusqu'à 767,98)
export function buildNarrowerThanQuery(widthPx: number): string {
	return `(max-width: ${widthPx - 0.02}px)`;
}

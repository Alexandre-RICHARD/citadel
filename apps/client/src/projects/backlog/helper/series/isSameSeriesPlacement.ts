type SeriesPlacement = {
	series: { id: number } | null;
	seriesNumber: number | null;
};

// Même série, même numéro : aucun autre jeu n'est renuméroté, les séries et leurs entrées restent telles quelles
export function isSameSeriesPlacement(
	before: SeriesPlacement,
	after: SeriesPlacement,
): boolean {
	return (
		before.series?.id === after.series?.id &&
		before.seriesNumber === after.seriesNumber
	);
}

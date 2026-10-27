import type { SeriesEntry } from "./seriesEntry.type.ts";

// Numéro après tous les autres : l'entier au-dessus du plus grand (3 après 2 ou 2.5), 1 pour le premier jeu
export function getNextSeriesNumber(entries: SeriesEntry[]): number {
	return (
		Math.floor(
			Math.max(0, ...entries.map(({ seriesNumber }) => seriesNumber)),
		) + 1
	);
}

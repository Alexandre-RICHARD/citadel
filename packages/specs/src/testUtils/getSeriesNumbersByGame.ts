import type { SeriesEntry } from "../projects/backlog/helper/seriesNumber/seriesEntry.type.ts";

// Le numéro de chaque jeu, quel que soit l'ordre du résultat : les fonctions de rangement ne trient pas
export function getSeriesNumbersByGame(
	entries: SeriesEntry[] | null,
): Record<number, number> | null {
	return entries === null
		? null
		: Object.fromEntries(
				entries.map(({ gameId, seriesNumber }) => [gameId, seriesNumber]),
			);
}

import { getFamily } from "./getFamily.ts";
import { isSeriesSubNumber } from "./isSeriesSubNumber.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";

// Ce qui bouge avec un jeu : un principal emmène les sous-jeux de sa famille ; un sous-jeu bouge seul
export function getSeriesBlock(
	entries: SeriesEntry[],
	gameId: number,
): SeriesEntry[] {
	const moved = entries.find((entry) => entry.gameId === gameId);
	if (moved === undefined) return [];

	const family = getFamily(moved.seriesNumber);
	return !isSeriesSubNumber(moved.seriesNumber)
		? [
				moved,
				...entries.filter(
					({ seriesNumber }) =>
						getFamily(seriesNumber) === family &&
						isSeriesSubNumber(seriesNumber),
				),
			]
		: [moved];
}

import { getFamily } from "./getFamily.ts";
import { getSubPart } from "./getSubPart.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";

// Ce qui bouge avec un jeu (cahier des charges, §8) : un principal emmène les sous-jeux de sa famille ; un sous-jeu bouge seul
export function getSeriesBlock(
	entries: SeriesEntry[],
	gameId: number,
): SeriesEntry[] {
	const moved = entries.find((entry) => entry.gameId === gameId);
	if (moved === undefined) return [];

	const family = getFamily(moved.seriesNumber);
	return getSubPart(moved.seriesNumber) === 0
		? [
				moved,
				...entries.filter(
					({ seriesNumber }) =>
						getFamily(seriesNumber) === family && getSubPart(seriesNumber) > 0,
				),
			]
		: [moved];
}

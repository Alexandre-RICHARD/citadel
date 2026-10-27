import { insertSubAfter } from "./insertSubAfter.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";

// Range des jeux à la suite comme sous-jeux de `family`, après `afterGameId`
export function insertSubsAfter(
	entries: SeriesEntry[],
	items: SeriesEntry[],
	family: number,
	afterGameId: number,
): SeriesEntry[] | null {
	let placed: SeriesEntry[] | null = entries;
	let previousGameId = afterGameId;
	for (const { gameId } of items) {
		placed =
			placed === null
				? null
				: insertSubAfter(placed, gameId, family, previousGameId);
		previousGameId = gameId;
	}
	return placed;
}

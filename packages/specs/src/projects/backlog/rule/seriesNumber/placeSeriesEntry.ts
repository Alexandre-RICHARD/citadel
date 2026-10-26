import { getFamily } from "./getFamily.ts";
import { getSeriesBlock } from "./getSeriesBlock.ts";
import { getSubPart } from "./getSubPart.ts";
import { insertFamily } from "./insertFamily.ts";
import { insertSub } from "./insertSub.ts";
import { insertSubsAfter } from "./insertSubsAfter.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";
import { sortSeriesEntries } from "./sortSeriesEntries.ts";

/**
 * Numéro tapé dans « Réorganiser la série », « Personnaliser » ou l'ajout au backlog (cahier des charges, §8) : un numéro pris
 * est libéré vers le haut. Un principal emmène ses sous-jeux ; devenu sous-jeu, il les range à sa suite. Un jeu absent de
 * `entries` y entre. Les numéros des autres jeux qui bougent sont dans le résultat, trié par numéro
 */
export function placeSeriesEntry(
	entries: SeriesEntry[],
	gameId: number,
	seriesNumber: number,
): SeriesEntry[] {
	const found = getSeriesBlock(entries, gameId);
	const block = found.length === 0 ? [{ gameId, seriesNumber }] : found;
	const blockIds = new Set(block.map((entry) => entry.gameId));
	const rest = entries.filter((entry) => !blockIds.has(entry.gameId));
	const family = getFamily(seriesNumber);
	const subPart = getSubPart(seriesNumber);
	const [head, ...subs] = block;
	if (head === undefined) return entries;

	let placed: SeriesEntry[] | null;
	if (subPart === 0) placed = insertFamily(rest, block, family, 1);
	else {
		const headPlaced = insertSub(rest, head.gameId, family, subPart, 1);
		placed =
			headPlaced === null
				? null
				: insertSubsAfter(headPlaced, subs, family, head.gameId);
	}
	return placed === null ? entries : sortSeriesEntries(placed);
}

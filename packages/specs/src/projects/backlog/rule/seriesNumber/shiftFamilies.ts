import { getFamily } from "./getFamily.ts";
import { getSubPart } from "./getSubPart.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";
import { toSeriesNumber } from "./toSeriesNumber.ts";

/**
 * Libère la famille `family` : elle avance (`direction` 1) ou recule (-1) d'un numéro avec ses sous-jeux,
 * et les familles suivantes, ou précédentes, tant qu'elles se heurtent ; un numéro libre arrête le décalage
 */
export function shiftFamilies(
	entries: SeriesEntry[],
	family: number,
	direction: 1 | -1,
): SeriesEntry[] {
	const shifted = new Set<number>();
	for (
		let current = family;
		entries.some(({ seriesNumber }) => getFamily(seriesNumber) === current);
		current += direction
	)
		shifted.add(current);

	return entries.map((entry) => {
		const entryFamily = getFamily(entry.seriesNumber);
		return shifted.has(entryFamily)
			? {
					...entry,
					seriesNumber: toSeriesNumber(
						entryFamily + direction,
						getSubPart(entry.seriesNumber),
					),
				}
			: entry;
	});
}

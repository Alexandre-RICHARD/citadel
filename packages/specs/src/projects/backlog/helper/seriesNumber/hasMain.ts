import { getFamily } from "./getFamily.ts";
import { isSeriesSubNumber } from "./isSeriesSubNumber.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";

// La famille a-t-elle son jeu principal (le numéro entier)
export function hasMain(entries: SeriesEntry[], family: number): boolean {
	return entries.some(
		({ seriesNumber }) =>
			getFamily(seriesNumber) === family && !isSeriesSubNumber(seriesNumber),
	);
}

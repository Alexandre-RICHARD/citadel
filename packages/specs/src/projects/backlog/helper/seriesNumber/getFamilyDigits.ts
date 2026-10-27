import { countSubPartDigits } from "./countSubPartDigits.ts";
import { getFamily } from "./getFamily.ts";
import { getSubPart } from "./getSubPart.ts";
import { isSeriesSubNumber } from "./isSeriesSubNumber.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";

// Chiffres des sous-jeux d'une famille : ceux du plus précis, au moins 1
export function getFamilyDigits(
	entries: SeriesEntry[],
	family: number,
): number {
	return Math.max(
		1,
		...entries.flatMap(({ seriesNumber }) =>
			getFamily(seriesNumber) === family && isSeriesSubNumber(seriesNumber)
				? [countSubPartDigits(getSubPart(seriesNumber))]
				: [],
		),
	);
}

import { getFamily } from "./getFamily.ts";
import { getFamilyDigits } from "./getFamilyDigits.ts";
import { getSubPart } from "./getSubPart.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";
import { SeriesNumberScaleEnum } from "./seriesNumberScale.enum.ts";
import { toSeriesNumber } from "./toSeriesNumber.ts";

/**
 * Un chiffre de plus pour les sous-jeux d'une famille, à rangs égaux :
 * 3.1 … 3.9 deviennent 3.01 … 3.09 ; `null` quand la famille a déjà 3 chiffres
 */
export function widenFamily(
	entries: SeriesEntry[],
	family: number,
): SeriesEntry[] | null {
	if (
		getFamilyDigits(entries, family) ===
		Number(SeriesNumberScaleEnum.MAX_DECIMALS)
	)
		return null;

	return entries.map((entry) =>
		getFamily(entry.seriesNumber) === family &&
		getSubPart(entry.seriesNumber) > 0
			? {
					...entry,
					seriesNumber: toSeriesNumber(
						family,
						getSubPart(entry.seriesNumber) / 10,
					),
				}
			: entry,
	);
}

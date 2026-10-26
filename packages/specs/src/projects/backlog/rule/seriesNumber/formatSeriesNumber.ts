import { countSubPartDigits } from "./countSubPartDigits.ts";
import { getFamily } from "./getFamily.ts";
import { getFamilyDigits } from "./getFamilyDigits.ts";
import { getSubPart } from "./getSubPart.ts";
import { getSubPartStep } from "./getSubPartStep.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";

/**
 * Numéro affiché (cahier des charges, §8) : les sous-jeux d'une famille avec le moins de décimales possible,
 * autant pour tous (3.10 parmi 3.01 … 3.10). `entries` : les jeux de la série, pour connaître la famille
 */
export function formatSeriesNumber(
	seriesNumber: number,
	entries: SeriesEntry[],
): string {
	const family = getFamily(seriesNumber);
	const subPart = getSubPart(seriesNumber);
	if (subPart === 0) return String(family);

	const digits = Math.max(
		countSubPartDigits(subPart),
		getFamilyDigits(entries, family),
	);
	return `${family}.${String(subPart / getSubPartStep(digits)).padStart(digits, "0")}`;
}

import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary.ts";

import { getFamilyDigits } from "./getFamilyDigits.ts";
import { getSubPartStep } from "./getSubPartStep.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";
import { toSeriesNumber } from "./toSeriesNumber.ts";

/**
 * Numéro tapé : un entier à partir de 1, ou un sous-jeu jusqu'à 3 décimales, virgule acceptée ;
 * `null` s'il est refusé. Avec moins de décimales que sa famille, c'est un rang : « 3.1 » parmi 3.01 … 3.10 donne 3.01.
 * Avec plus, la famille en prend autant et ses sous-jeux gardent leur valeur : « 3.15 » parmi 3.1 et 3.2 se place entre les deux
 */
export function parseSeriesNumber(
	text: string,
	entries: SeriesEntry[],
): number | null {
	const match = regexDictionary.seriesNumberInput.exec(text.trim());
	if (match === null) return null;

	const [, familyText = "", decimals = ""] = match;
	const family = Number(familyText);
	if (family < 1) return null;
	if (Number(decimals) === 0) return family;

	const digits = Math.max(decimals.length, getFamilyDigits(entries, family));
	return toSeriesNumber(family, Number(decimals) * getSubPartStep(digits));
}

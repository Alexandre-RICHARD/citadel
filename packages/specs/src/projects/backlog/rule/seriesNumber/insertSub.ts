import { countSubPartDigits } from "./countSubPartDigits.ts";
import { getFamily } from "./getFamily.ts";
import { getFamilyDigits } from "./getFamilyDigits.ts";
import { getSubPart } from "./getSubPart.ts";
import { getSubPartStep } from "./getSubPartStep.ts";
import { isSubPartUsed } from "./isSubPartUsed.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";
import { SeriesNumberScaleEnum } from "./seriesNumberScale.enum.ts";
import { toSeriesNumber } from "./toSeriesNumber.ts";
import { widenFamily } from "./widenFamily.ts";

/**
 * Range un sous-jeu au rang `subPart` de sa famille (cahier des charges, §8). Un rang pris est libéré : son sous-jeu avance
 * (`direction` 1) ou recule (-1) d'un cran, avec les suivants, ou précédents, tant qu'ils se heurtent. Avancer au-delà du
 * dernier rang (3.9, 3.99) fait d'abord passer la famille à un chiffre de plus. `null` au-delà de 3.999
 */
export function insertSub(
	entries: SeriesEntry[],
	gameId: number,
	family: number,
	subPart: number,
	direction: 1 | -1,
): SeriesEntry[] | null {
	const step =
		direction *
		getSubPartStep(
			Math.max(getFamilyDigits(entries, family), countSubPartDigits(subPart)),
		);
	const shifted = new Set<number>();
	let current = subPart;
	for (; isSubPartUsed(entries, family, current); current += step)
		shifted.add(current);

	if (current >= Number(SeriesNumberScaleEnum.THOUSANDTHS)) {
		const widened = widenFamily(entries, family);
		return widened === null
			? null
			: insertSub(widened, gameId, family, subPart / 10, direction);
	}

	return [
		...entries.map((entry) =>
			getFamily(entry.seriesNumber) === family &&
			shifted.has(getSubPart(entry.seriesNumber))
				? {
						...entry,
						seriesNumber: toSeriesNumber(
							family,
							getSubPart(entry.seriesNumber) + step,
						),
					}
				: entry,
		),
		{ gameId, seriesNumber: toSeriesNumber(family, subPart) },
	];
}

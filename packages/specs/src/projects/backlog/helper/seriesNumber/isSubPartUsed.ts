import { getFamily } from "./getFamily.ts";
import { getSubPart } from "./getSubPart.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";

export function isSubPartUsed(
	entries: SeriesEntry[],
	family: number,
	subPart: number,
): boolean {
	return entries.some(
		({ seriesNumber }) =>
			getFamily(seriesNumber) === family &&
			getSubPart(seriesNumber) === subPart,
	);
}

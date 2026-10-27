import { formatUtcIsoDate } from "./formatUtcIsoDate.ts";
import type { IsoDate } from "./isoDate.type.ts";
import { parseUtcIsoDate } from "./parseUtcIsoDate.ts";

// days négatif pour reculer
export function addDaysToIsoDate(isoDate: IsoDate, days: number): IsoDate {
	const date = parseUtcIsoDate(isoDate);
	date.setUTCDate(date.getUTCDate() + days);
	return formatUtcIsoDate(date);
}

import { formatUtcIsoDate } from "./formatUtcIsoDate.ts";
import { getDaysInMonth } from "./getDaysInMonth.ts";
import type { IsoDate } from "./isoDate.type.ts";
import { parseUtcIsoDate } from "./parseUtcIsoDate.ts";

// Même jour, `months` mois plus loin, ramené au dernier jour du mois s'il n'existe pas (31 janvier → 28 février)
export function addMonthsToIsoDate(isoDate: IsoDate, months: number): IsoDate {
	const date = parseUtcIsoDate(isoDate);
	const day = date.getUTCDate();
	date.setUTCDate(1);
	date.setUTCMonth(date.getUTCMonth() + months);
	date.setUTCDate(
		Math.min(
			day,
			getDaysInMonth(date.getUTCFullYear(), date.getUTCMonth() + 1),
		),
	);
	return formatUtcIsoDate(date);
}

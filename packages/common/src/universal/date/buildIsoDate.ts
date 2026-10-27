import { padWithZeros } from "../number/padWithZeros.ts";
import type { IsoDate } from "./isoDate.type.ts";

// month de 1 (janvier) à 12 ; la date n'est pas vérifiée (voir isExistingDate)
export function buildIsoDate(
	year: number,
	month: number,
	day: number,
): IsoDate {
	return `${padWithZeros(year, 4)}-${padWithZeros(month)}-${padWithZeros(day)}` as IsoDate;
}

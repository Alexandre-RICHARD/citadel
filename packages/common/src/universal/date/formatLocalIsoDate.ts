import { padWithZeros } from "../number/padWithZeros.ts";
import type { IsoDate } from "./isoDate.type.ts";

// Le jour de la date en heure locale, celui que voit l'utilisateur
export function formatLocalIsoDate(date: Date): IsoDate {
	return `${padWithZeros(date.getFullYear(), 4)}-${padWithZeros(date.getMonth() + 1)}-${padWithZeros(date.getDate())}` as IsoDate;
}

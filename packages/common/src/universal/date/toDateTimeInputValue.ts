import { padWithZeros } from "../number/padWithZeros.ts";
import { formatLocalIsoDate } from "./formatLocalIsoDate.ts";

// Valeur d'un <input type="datetime-local"> (AAAA-MM-JJTHH:MM, heure locale). Chaîne vide, qui vide le champ, si la date est invalide
export function toDateTimeInputValue(iso: string | Date): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return `${formatLocalIsoDate(date)}T${padWithZeros(date.getHours())}:${padWithZeros(date.getMinutes())}`;
}

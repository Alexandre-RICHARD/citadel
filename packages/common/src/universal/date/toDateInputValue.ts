import { formatLocalIsoDate } from "./formatLocalIsoDate.ts";

// Valeur d'un <input type="date"> (AAAA-MM-JJ, heure locale). Chaîne vide, qui vide le champ, si la date est invalide
export function toDateInputValue(iso: string | Date): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return formatLocalIsoDate(date);
}

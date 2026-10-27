import { getDaysInMonth } from "./getDaysInMonth.ts";

// Le jour existe dans le calendrier : pas de 31 février ni de mois 13. month de 1 (janvier) à 12
export function isExistingDate(
	year: number,
	month: number,
	day: number,
): boolean {
	return (
		Number.isInteger(year) &&
		Number.isInteger(month) &&
		Number.isInteger(day) &&
		month >= 1 &&
		month <= 12 &&
		day >= 1 &&
		day <= getDaysInMonth(year, month)
	);
}

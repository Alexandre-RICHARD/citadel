// month de 1 (janvier) à 12
export function getDaysInMonth(year: number, month: number): number {
	// Le jour 0 du mois suivant est le dernier jour du mois
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

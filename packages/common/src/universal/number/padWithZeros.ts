// 5 → "05" : l'écriture des jours, mois, heures et minutes
export function padWithZeros(value: number, length = 2): string {
	return String(value).padStart(length, "0");
}

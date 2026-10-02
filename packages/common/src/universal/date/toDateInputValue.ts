function pad(n: number, length = 2): string {
	return String(n).padStart(length, "0");
}

// Valeur d'un <input type="date"> (AAAA-MM-JJ, heure locale). Chaîne vide, qui vide le champ, si la date est invalide
export function toDateInputValue(iso: string | Date): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";

	return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

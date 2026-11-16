// Année d'une date ISO (AAAA-MM-JJ) ; null sans date
export function getReleaseYear(date: string | null): number | null {
	return date === null ? null : Number(date.slice(0, 4));
}

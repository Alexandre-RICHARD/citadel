// « 1 caractère », « 3 caractères » : le pluriel français régulier, d'un « s »
export function pluralize(count: number, word: string): string {
	return `${count} ${word}${Math.abs(count) > 1 ? "s" : ""}`;
}

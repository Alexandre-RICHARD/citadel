const countFormat = new Intl.NumberFormat("fr-FR");

// Un nombre de torrents ou de fichiers, avec ses milliers séparés : « 2 941 »
export function formatCount(count: number): string {
	return countFormat.format(count);
}

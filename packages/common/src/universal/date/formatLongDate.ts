// Date seule, mois en toutes lettres : "22 septembre 2011". null si la date est absente ou invalide
export function formatLongDate(iso?: string | Date | null): string | null {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;

	return date.toLocaleDateString("fr-FR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

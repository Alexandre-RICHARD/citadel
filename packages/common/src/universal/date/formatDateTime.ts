// Date et heure, mois abrégé : "22 sept. 2011, 10:00". null si la date est absente ou invalide
export function formatDateTime(iso?: string | Date | null): string | null {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;

	return date.toLocaleString("fr-FR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

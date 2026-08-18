export function formatDate(iso?: string | Date | null): string | null {
	if (!iso) return null;
	return new Date(iso).toLocaleDateString("fr-FR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

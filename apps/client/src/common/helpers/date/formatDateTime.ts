export function formatDateTime(iso?: string | Date | null): string | null {
	if (!iso) return null;
	return new Date(iso).toLocaleString("fr-FR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

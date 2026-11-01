const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
	weekday: "short",
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
});

// « dim. 1 nov., 05:00 » : un passage de job, une sauvegarde
export function formatDateTime(date: Date): string {
	return dateTimeFormat.format(date);
}

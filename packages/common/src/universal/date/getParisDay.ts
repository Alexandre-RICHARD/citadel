// Le jour en France (2026-11-01) : le quota de Brevo se compte par jour, en heure de Paris, et le serveur tourne en UTC
const parisDayFormat = new Intl.DateTimeFormat("sv-SE", {
	timeZone: "Europe/Paris",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

export function getParisDay(timestamp: number): string {
	return parisDayFormat.format(timestamp);
}

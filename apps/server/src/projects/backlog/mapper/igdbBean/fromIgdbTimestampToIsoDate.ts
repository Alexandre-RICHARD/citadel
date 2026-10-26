const SECOND_MS = 1000;
const ISO_DATE_LENGTH = "YYYY-MM-DD".length;

// Timestamp Unix d'IGDB (en secondes, 00:00 UTC du jour annoncé) → date ISO ; null sans date
export function fromIgdbTimestampToIsoDate(
	seconds: number | undefined,
): string | null {
	return seconds === undefined
		? null
		: new Date(seconds * SECOND_MS).toISOString().slice(0, ISO_DATE_LENGTH);
}

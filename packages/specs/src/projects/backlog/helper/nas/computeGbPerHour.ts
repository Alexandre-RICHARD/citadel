const BYTES_PER_GB = 1_000_000_000;
const MINUTES_PER_HOUR = 60;

/**
 * Le poids par heure (§5) : la taille divisée par la durée réelle du fichier. Deux films d'1 h 30, l'un de 2 Go et
 * l'autre de 6 Go, s'y distinguent. Sans durée connue, pas de poids par heure
 */
export function computeGbPerHour(
	sizeBytes: number | null,
	durationMinutes: number | null,
): number | null {
	if (sizeBytes === null || durationMinutes === null || durationMinutes <= 0)
		return null;
	return sizeBytes / BYTES_PER_GB / (durationMinutes / MINUTES_PER_HOUR);
}

// Au-delà, la durée du fichier passe en alerte : une version longue ou un autre montage (§5)
const RUNTIME_TOLERANCE_MINUTES = 7.5;

/**
 * La durée réelle du fichier s'écarte-t-elle de celle de TMDB ? Sans l'une des deux, rien à comparer. Un fichier vérifié
 * n'est plus en alerte : c'est à l'appelant de le dire
 */
export function isRuntimeMismatch(
	fileMinutes: number | null,
	tmdbMinutes: number | null,
): boolean {
	return (
		fileMinutes !== null &&
		tmdbMinutes !== null &&
		tmdbMinutes > 0 &&
		Math.abs(fileMinutes - tmdbMinutes) > RUNTIME_TOLERANCE_MINUTES
	);
}

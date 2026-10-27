const MILLISECONDS_PER_SECOND = 1000;

// Un timestamp Unix en secondes (IGDB, GTFS-RT…) ; Date les compte en millisecondes
export function fromUnixSecondsToDate(seconds: number): Date {
	return new Date(seconds * MILLISECONDS_PER_SECOND);
}

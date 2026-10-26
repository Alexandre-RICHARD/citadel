import type { SeriesEntryFm } from "../../api/model/seriesEntryFm.type";

/**
 * Jeux sortis avant un jeu placé plus haut dans la série : pour chacun, le jeu au-dessus qui
 * sort après lui. `entries` : dans l'ordre affiché
 */
export function getSeriesOrderConflicts(
	entries: SeriesEntryFm[],
): Map<number, SeriesEntryFm> {
	const conflicts = new Map<number, SeriesEntryFm>();
	let latest: SeriesEntryFm | null = null;
	for (const entry of entries) {
		const date = entry.firstReleaseDate;
		if (date === null) continue;
		if (latest?.firstReleaseDate != null && date < latest.firstReleaseDate)
			conflicts.set(entry.gameId, latest);
		else latest = entry;
	}
	return conflicts;
}

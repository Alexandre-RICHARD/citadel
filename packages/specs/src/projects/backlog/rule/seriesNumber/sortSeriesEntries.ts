import type { SeriesEntry } from "./seriesEntry.type.ts";

export function sortSeriesEntries(entries: SeriesEntry[]): SeriesEntry[] {
	return entries.toSorted(
		(first, second) => first.seriesNumber - second.seriesNumber,
	);
}

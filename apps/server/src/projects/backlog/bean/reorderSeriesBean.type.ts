import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/seriesEntry.type.ts";

export type ReorderSeriesBean = {
	seriesId: number;
	entries: SeriesEntry[];
};

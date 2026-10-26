import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/seriesEntry.type.ts";

export type ReorderSeriesBean = {
	seriesId: number;
	entries: SeriesEntry[];
};

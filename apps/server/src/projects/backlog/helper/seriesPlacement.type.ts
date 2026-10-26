import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/seriesEntry.type.ts";

// Où un jeu du backlog se range dans la série choisie, et les autres jeux de la série que cela décale
export type SeriesPlacement = {
	seriesId: number | null;
	seriesNumber: number | null;
	shiftedEntries: SeriesEntry[];
};

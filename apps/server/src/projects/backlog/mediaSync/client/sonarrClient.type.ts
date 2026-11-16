import type { ArrQueue } from "./arrQueue.type.ts";
import type { SonarrSeriesDetails } from "./sonarrSeriesDetails.type.ts";

export type SonarrClient = {
	seriesDetails: () => Promise<SonarrSeriesDetails[]>;
	queue: () => Promise<ArrQueue>;
};

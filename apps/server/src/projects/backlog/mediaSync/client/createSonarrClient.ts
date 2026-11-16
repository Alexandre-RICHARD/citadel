import { mapWithConcurrency } from "@citadel/common/src/universal/async/mapWithConcurrency.ts";
import { z } from "zod";

import { arrQueueSchema } from "./arrQueueSchema.ts";
import { createArrGetter } from "./createArrGetter.ts";
import type { SonarrClient } from "./sonarrClient.type.ts";
import { sonarrEpisodeFileSchema } from "./sonarrEpisodeFileSchema.ts";
import { sonarrEpisodeSchema } from "./sonarrEpisodeSchema.ts";
import { sonarrSeriesSchema } from "./sonarrSeriesSchema.ts";

// Quatre séries lues à la fois : Sonarr, sur le N95, reste réactif
const CONCURRENCY = 4;

// Sonarr, par le réseau de Gluetun (media-gluetun:8989), en lecture seule
export function createSonarrClient(settings: {
	url: string;
	apiKey: string;
}): SonarrClient {
	const get = createArrGetter("Sonarr", settings);
	return {
		async seriesDetails() {
			const seriesList = await get("/series", z.array(sonarrSeriesSchema));
			return mapWithConcurrency(seriesList, CONCURRENCY, async (series) => {
				const parameters = { seriesId: String(series.id) };
				const [episodes, files] = await Promise.all([
					get("/episode", z.array(sonarrEpisodeSchema), parameters),
					get("/episodefile", z.array(sonarrEpisodeFileSchema), parameters),
				]);
				return { series, episodes, files };
			});
		},
		queue: () => get("/queue", arrQueueSchema, { pageSize: "5000" }),
	};
}

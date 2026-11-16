import { z } from "zod";

import { arrQueueSchema } from "./arrQueueSchema.ts";
import { createArrGetter } from "./createArrGetter.ts";
import type { RadarrClient } from "./radarrClient.type.ts";
import { radarrMovieSchema } from "./radarrMovieSchema.ts";

// Radarr, par le réseau de Gluetun (media-gluetun:7878), en lecture seule
export function createRadarrClient(settings: {
	url: string;
	apiKey: string;
}): RadarrClient {
	const get = createArrGetter("Radarr", settings);
	return {
		movies: () => get("/movie", z.array(radarrMovieSchema)),
		queue: () =>
			get("/queue", arrQueueSchema, {
				pageSize: "5000",
				includeMovie: "false",
			}),
	};
}

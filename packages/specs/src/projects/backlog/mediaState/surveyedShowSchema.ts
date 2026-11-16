import { z } from "zod";

import { surveyedEpisodeSchema } from "./surveyedEpisodeSchema.ts";

/**
 * Une série trouvée sur le NAS, et ses épisodes relevés. `jellyfinItemId` : la série dans Jellyfin, pour « Ouvrir dans
 * Jellyfin » sur sa ligne
 */
export const surveyedShowSchema = z.object({
	tmdbId: z.number().int().positive(),
	title: z.string().min(1).nullable(),
	year: z.number().int().nullable(),
	jellyfinItemId: z.string().min(1).nullable(),
	jellyfinCollection: z.string().min(1).nullable(),
	episodes: z.array(surveyedEpisodeSchema),
});

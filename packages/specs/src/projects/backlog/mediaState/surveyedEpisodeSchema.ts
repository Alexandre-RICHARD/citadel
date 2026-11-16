import { z } from "zod";

import { nasEntrySchema } from "./nasEntrySchema.ts";

// Un épisode, par ses numéros TMDB. Les spéciaux (saison 0), que Sonarr numérote autrement, n'ont pas de relevé (§5)
export const surveyedEpisodeSchema = z.object({
	seasonNumber: z.number().int().positive(),
	episodeNumber: z.number().int().positive(),
	entry: nasEntrySchema,
});

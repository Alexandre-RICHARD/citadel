import { z } from "zod";

import { arrMediaInfoSchema } from "./arrMediaInfoSchema.ts";

// Un fichier d'épisode de Sonarr (GET /api/v3/episodefile?seriesId=)
export const sonarrEpisodeFileSchema = z.object({
	id: z.number().int(),
	path: z.string(),
	size: z.number(),
	mediaInfo: arrMediaInfoSchema.nullish(),
});

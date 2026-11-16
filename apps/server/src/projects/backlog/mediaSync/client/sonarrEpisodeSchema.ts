import { z } from "zod";

// Un épisode de Sonarr, numéroté comme TVDB (GET /api/v3/episode?seriesId=)
export const sonarrEpisodeSchema = z.object({
	id: z.number().int(),
	seasonNumber: z.number().int(),
	episodeNumber: z.number().int(),
	episodeFileId: z.number().int().nullish(),
	title: z.string().nullish(),
});

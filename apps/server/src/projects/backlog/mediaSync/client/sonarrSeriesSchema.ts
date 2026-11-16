import { z } from "zod";

// Une série de Sonarr (GET /api/v3/series). tmdbId vaut 0 quand Sonarr n'en connaît pas
export const sonarrSeriesSchema = z.object({
	id: z.number().int(),
	tmdbId: z.number().int().nullish(),
	title: z.string(),
	year: z.number().int().nullish(),
	path: z.string(),
});

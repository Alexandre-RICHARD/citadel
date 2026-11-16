import { z } from "zod";

import { arrMediaInfoSchema } from "./arrMediaInfoSchema.ts";

// Un film de Radarr (GET /api/v3/movie), et son fichier s'il en a un
export const radarrMovieSchema = z.object({
	id: z.number().int(),
	tmdbId: z.number().int(),
	title: z.string(),
	year: z.number().int().nullish(),
	path: z.string(),
	movieFile: z
		.object({
			path: z.string(),
			size: z.number(),
			mediaInfo: arrMediaInfoSchema.nullish(),
		})
		.nullish(),
});

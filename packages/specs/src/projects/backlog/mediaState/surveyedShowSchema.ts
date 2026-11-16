import { z } from "zod";

import { surveyedEpisodeSchema } from "./surveyedEpisodeSchema.ts";
import { surveyedFolderSchema } from "./surveyedFolderSchema.ts";

const tmdbIdSchema = z.number().int().positive();

/**
 * Une série trouvée sur le NAS, et ses épisodes relevés. Comme pour un film (surveyedMovieSchema), `tmdbId` est celui de
 * Sonarr, sinon celui de Jellyfin ; une série qu'aucun des deux ne relie à TMDB va dans `unlinked`. `jellyfinItemId` :
 * la série dans Jellyfin, pour « Ouvrir dans Jellyfin » sur sa ligne
 */
export const surveyedShowSchema = z.object({
	tmdbId: tmdbIdSchema,
	toolTmdbId: tmdbIdSchema.nullable(),
	jellyfinTmdbId: tmdbIdSchema.nullable(),
	folder: surveyedFolderSchema.nullable(),
	title: z.string().min(1).nullable(),
	year: z.number().int().nullable(),
	jellyfinItemId: z.string().min(1).nullable(),
	jellyfinCollection: z.string().min(1).nullable(),
	episodes: z.array(surveyedEpisodeSchema),
});

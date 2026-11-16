import { z } from "zod";

import { nasEntrySchema } from "./nasEntrySchema.ts";

/**
 * Un film trouvé sur le NAS (disque, Radarr, Jellyfin ou qBittorrent), qu'il soit dans un backlog ou non : le job ne lit
 * pas la base du site. `title` et `year` : ceux de l'outil qui l'a trouvé, pour nommer un média oublié sans appeler TMDB
 */
export const surveyedMovieSchema = z.object({
	tmdbId: z.number().int().positive(),
	title: z.string().min(1).nullable(),
	year: z.number().int().nullable(),
	jellyfinCollection: z.string().min(1).nullable(),
	entry: nasEntrySchema,
});

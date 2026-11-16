import { z } from "zod";

import { nasEntrySchema } from "./nasEntrySchema.ts";
import { surveyedFolderSchema } from "./surveyedFolderSchema.ts";

const tmdbIdSchema = z.number().int().positive();

/**
 * Un film trouvé sur le NAS (disque, Radarr, Jellyfin ou qBittorrent), qu'il soit dans un backlog ou non : le job ne lit
 * pas la base du site, et ne tranche donc pas quel identifiant est le bon. Il note ce que dit chaque source :
 * `toolTmdbId` (Radarr), `jellyfinTmdbId` (l'élément Jellyfin du fichier) et le dossier. `tmdbId` : celui sous lequel il
 * le range, celui de Radarr, sinon celui de Jellyfin, sinon aucun. L'instance locale, qui connaît le backlog, relie
 * chaque film du backlog à un film du relevé et en tire les écarts « Fiche différente » (§5).
 * `title` et `year` : ceux de l'outil qui l'a trouvé, pour nommer un média oublié sans appeler TMDB
 */
export const surveyedMovieSchema = z.object({
	tmdbId: tmdbIdSchema.nullable(),
	toolTmdbId: tmdbIdSchema.nullable(),
	jellyfinTmdbId: tmdbIdSchema.nullable(),
	folder: surveyedFolderSchema.nullable(),
	title: z.string().min(1).nullable(),
	year: z.number().int().nullable(),
	jellyfinCollection: z.string().min(1).nullable(),
	entry: nasEntrySchema,
});

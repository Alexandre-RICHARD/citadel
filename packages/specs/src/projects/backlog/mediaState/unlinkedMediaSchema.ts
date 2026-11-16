import { z } from "zod";

import { NasToolEnum } from "../enum/nasTool.enum.ts";

/**
 * Un dossier de média qu'aucun outil ne relie à TMDB (ajouté à la main, nom de dossier illisible) : il n'est listé que
 * par son chemin, avec les endroits où il est. Les torrents dont les fichiers ne sont que dans torrents/ n'en sont pas :
 * ils vont au rapport de la console
 */
export const unlinkedMediaSchema = z.object({
	path: z.string().min(1),
	trackedBy: z.enum(NasToolEnum).nullable(),
	fileCount: z.number().int().nonnegative(),
	sizeBytes: z.number().int().nonnegative(),
	isInJellyfin: z.boolean(),
	torrentCount: z.number().int().nonnegative(),
});

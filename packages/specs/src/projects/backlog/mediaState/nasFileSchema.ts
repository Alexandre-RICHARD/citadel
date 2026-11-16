import { z } from "zod";

import { NasQualityEnum } from "../enum/nasQuality.enum.ts";

// Code de langue ISO 639-1 (« fr », « en ») : les pistes sans langue connue ne sont pas listées
const languageCodeSchema = z.string().regex(/^[a-z]{2}$/);

/**
 * Le fichier d'un film ou d'un épisode, tel que le job l'a trouvé. `inode` et `sizeBytes` forment son empreinte : une
 * case « Vérifié » ne vaut que pour elle. Durée et langues viennent de Radarr et Sonarr, qui les lisent dans le fichier ;
 * les sous-titres posés à côté (Bazarr), de Jellyfin
 */
export const nasFileSchema = z.object({
	path: z.string().min(1),
	inode: z.number().int().nonnegative(),
	sizeBytes: z.number().int().nonnegative(),
	quality: z.enum(NasQualityEnum).nullable(),
	durationMinutes: z.number().nonnegative().nullable(),
	audioLanguages: z.array(languageCodeSchema),
	subtitleLanguages: z.array(languageCodeSchema),
});

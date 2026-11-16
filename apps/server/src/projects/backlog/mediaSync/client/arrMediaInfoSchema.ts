import { z } from "zod";

/**
 * Ce que Radarr et Sonarr lisent dans un fichier (mediaInfo) : « 1920x1080 », « 1:52:03 », et les langues par leur nom,
 * séparées par « / » (« French/English »)
 */
export const arrMediaInfoSchema = z.object({
	resolution: z.string().nullish(),
	runTime: z.string().nullish(),
	audioLanguages: z.string().nullish(),
	subtitles: z.string().nullish(),
});

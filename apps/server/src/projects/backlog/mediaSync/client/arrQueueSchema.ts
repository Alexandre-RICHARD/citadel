import { z } from "zod";

// La file de téléchargement de Radarr ou de Sonarr : le torrent (son hash, downloadId) de chaque film ou épisode attendu
export const arrQueueSchema = z.object({
	records: z.array(
		z.object({
			movieId: z.number().int().nullish(),
			episodeId: z.number().int().nullish(),
			downloadId: z.string().nullish(),
		}),
	),
});

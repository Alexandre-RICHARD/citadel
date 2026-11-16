import { z } from "zod";

/**
 * Une adresse de tracker d'un torrent (GET /api/v2/torrents/trackers). status : 0 désactivé, 1 pas encore contacté,
 * 2 fonctionne, 3 en cours de mise à jour, 4 ne fonctionne pas
 */
export const qbittorrentTrackerSchema = z.object({
	url: z.string(),
	status: z.number().int(),
	msg: z.string().nullish(),
	tier: z.union([z.number(), z.string()]).nullish(),
});

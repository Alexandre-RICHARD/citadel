import { z } from "zod";

// Un torrent de qBittorrent (GET /api/v2/torrents/info). progress : de 0 à 1 ; added_on : en secondes
export const qbittorrentTorrentSchema = z.object({
	hash: z.string().min(1),
	name: z.string().min(1),
	save_path: z.string(),
	category: z.string().nullish(),
	tags: z.string().nullish(),
	added_on: z.number(),
	progress: z.number(),
	size: z.number(),
	state: z.string(),
});

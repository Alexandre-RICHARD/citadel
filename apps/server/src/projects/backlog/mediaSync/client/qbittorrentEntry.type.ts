import type { z } from "zod";

import type { qbittorrentTorrentSchema } from "./qbittorrentTorrentSchema.ts";
import type { qbittorrentTrackerSchema } from "./qbittorrentTrackerSchema.ts";

// Un torrent avec ses fichiers (chemins relatifs à save_path) et ses vrais trackers (ni DHT, ni PeX, ni LSD)
export type QbittorrentEntry = {
	torrent: z.infer<typeof qbittorrentTorrentSchema>;
	fileNames: string[];
	trackers: z.infer<typeof qbittorrentTrackerSchema>[];
};

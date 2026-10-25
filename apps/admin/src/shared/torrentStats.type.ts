import type { Unavailable } from "./unavailable.type.ts";

// Octets et octets par seconde
export type TorrentStats =
	| {
			available: true;
			downloadSpeed: number;
			uploadSpeed: number;
			sessionDownloaded: number;
			sessionUploaded: number;
			allTimeDownloaded: number | null;
			allTimeUploaded: number | null;
			ratio: number | null;
	  }
	| Unavailable;

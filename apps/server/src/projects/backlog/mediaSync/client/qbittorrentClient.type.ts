import type { QbittorrentEntry } from "./qbittorrentEntry.type.ts";

export type QbittorrentClient = {
	entries: () => Promise<QbittorrentEntry[]>;
	addTag: (hashes: string[], tag: string) => Promise<void>;
	removeTag: (hashes: string[], tag: string) => Promise<void>;
};

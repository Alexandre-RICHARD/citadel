import type { TorrentVolume } from "./torrentVolume.type.ts";

// L'historique de qBittorrent, tiré des relevés horaires d'infra-ops. Le plus récent
// en premier.
export type TorrentHistory = {
	days: TorrentVolume[];
	weeks: TorrentVolume[];
};

import type { JellyfinClient } from "../client/jellyfinClient.type.ts";
import type { QbittorrentClient } from "../client/qbittorrentClient.type.ts";
import type { RadarrClient } from "../client/radarrClient.type.ts";
import type { SonarrClient } from "../client/sonarrClient.type.ts";

export type MediaSyncClients = {
	radarr: RadarrClient;
	sonarr: SonarrClient;
	jellyfin: JellyfinClient;
	qbittorrent: QbittorrentClient;
};

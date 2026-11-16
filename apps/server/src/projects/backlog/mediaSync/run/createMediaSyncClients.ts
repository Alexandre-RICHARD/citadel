import { createJellyfinClient } from "../client/createJellyfinClient.ts";
import { createQbittorrentClient } from "../client/createQbittorrentClient.ts";
import { createRadarrClient } from "../client/createRadarrClient.ts";
import { createSonarrClient } from "../client/createSonarrClient.ts";
import type { MediaSyncSettings } from "../settings/mediaSyncSettings.type.ts";
import type { MediaSyncClients } from "./mediaSyncClients.type.ts";

export function createMediaSyncClients(
	settings: MediaSyncSettings,
): MediaSyncClients {
	return {
		radarr: createRadarrClient(settings.radarr),
		sonarr: createSonarrClient(settings.sonarr),
		jellyfin: createJellyfinClient(settings.jellyfin),
		qbittorrent: createQbittorrentClient(settings.qbittorrent),
	};
}

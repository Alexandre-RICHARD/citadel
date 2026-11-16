import type { CrossSeedSearchEnum } from "@citadel/specs/src/projects/backlog/mediaSyncReport/crossSeedSearch.enum.ts";

import type { TrackerDefinition } from "../torrent/trackerDefinition.type.ts";

// Ce que le job media-sync lit dans son environnement (readMediaSyncSettings) ; les adresses sans « / » final
export type MediaSyncSettings = {
	// /Volume2/data, monté en lecture seule au même chemin que dans qBittorrent, Radarr, Sonarr et Jellyfin
	dataDir: string;
	mediaStateDir: string;
	// Le dossier state/ d'infra-ops, où va le rapport pour la console
	citadelStateDir: string;
	radarr: { url: string; apiKey: string };
	sonarr: { url: string; apiKey: string };
	jellyfin: { url: string; apiKey: string };
	qbittorrent: { url: string; user: string; password: string };
	trackers: TrackerDefinition[];
	crossSeedSearch: CrossSeedSearchEnum;
};

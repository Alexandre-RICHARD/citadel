// Où est le fichier d'un film ou d'un épisode (§5), du moins avancé au plus avancé : il dit où est le fichier, pas qui le
// suit. Une saison ou une série prend l'état le moins avancé de ses épisodes
export enum NasStorageEnum {
	// Ni fichier, ni dans Radarr ou Sonarr
	NOT_TRACKED = "not_tracked",
	// Dans Radarr ou Sonarr, sans fichier
	EXPECTED = "expected",
	// Dans qBittorrent, pas fini
	DOWNLOADING = "downloading",
	// Fini, pas dans Jellyfin
	PRESENT = "present",
	IN_JELLYFIN = "in_jellyfin",
}

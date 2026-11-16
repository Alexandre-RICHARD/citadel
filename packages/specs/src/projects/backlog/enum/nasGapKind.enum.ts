// Ce que le job a trouvé de faux au dernier passage (§5), un filtre par sorte d'écart
export enum NasGapKindEnum {
	// Plusieurs fichiers distincts (d'inodes différents) pour ce film ou cet épisode
	DUPLICATE = "duplicate",
	// Radarr ou Sonarr relie le fichier à un autre identifiant TMDB
	TOOL_MISMATCH = "tool_mismatch",
	// Jellyfin relie le fichier à un autre identifiant TMDB, ou à aucun
	JELLYFIN_MISMATCH = "jellyfin_mismatch",
	// Le fichier existe, ni Radarr ni Sonarr ne le suit
	UNTRACKED = "untracked",
	// TMDB ne connaît plus l'identifiant
	TMDB_ID_GONE = "tmdb_id_gone",
}

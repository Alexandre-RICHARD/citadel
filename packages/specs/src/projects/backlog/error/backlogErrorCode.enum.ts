// Codes d'erreur métier du Backlog, partagés entre les endpoints
export enum BacklogErrorCodeEnum {
	// En base
	GAME_NOT_FOUND = "GAME_NOT_FOUND",
	// Version absente de la base pour ce jeu, ou de sa fiche IGDB à l'enregistrement
	VERSION_NOT_FOUND = "VERSION_NOT_FOUND",
	// DLC absent de la base pour ce jeu, ou de sa fiche IGDB à l'enregistrement
	DLC_NOT_FOUND = "DLC_NOT_FOUND",
	SERIES_NOT_FOUND = "SERIES_NOT_FOUND",
	USER_GAME_NOT_FOUND = "USER_GAME_NOT_FOUND",
	USER_VERSION_NOT_FOUND = "USER_VERSION_NOT_FOUND",
	// Sur IGDB
	IGDB_GAME_NOT_FOUND = "IGDB_GAME_NOT_FOUND",
	// IGDB injoignable, ou réponse inattendue (token refusé, quota…) : l'action peut réussir plus tard
	IGDB_UNAVAILABLE = "IGDB_UNAVAILABLE",
	// En conflit avec l'état de la base
	GAME_ALREADY_STORED = "GAME_ALREADY_STORED",
	USER_GAME_ALREADY_EXISTS = "USER_GAME_ALREADY_EXISTS",
	// Même version sur la même plateforme : une seule version jouée
	USER_VERSION_ALREADY_EXISTS = "USER_VERSION_ALREADY_EXISTS",
	// Ni une plateforme de la version, ni un émulateur de l'une d'elles
	PLATFORM_NOT_ALLOWED = "PLATFORM_NOT_ALLOWED",
	// Statut que le type de fin du jeu ne propose pas
	STATUS_NOT_ALLOWED = "STATUS_NOT_ALLOWED",
	// Les jeux envoyés pour « Réorganiser la série » ne sont plus exactement ceux de la série
	SERIES_ENTRIES_MISMATCH = "SERIES_ENTRIES_MISMATCH",
}

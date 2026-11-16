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
	// Le jeu est dans le backlog d'un compte : il ne peut pas quitter la base
	GAME_IN_A_BACKLOG = "GAME_IN_A_BACKLOG",
	// Même version sur la même plateforme : une seule version jouée
	USER_VERSION_ALREADY_EXISTS = "USER_VERSION_ALREADY_EXISTS",
	// Ni une plateforme de la version, ni un émulateur de l'une d'elles
	PLATFORM_NOT_ALLOWED = "PLATFORM_NOT_ALLOWED",
	// Statut que le type de fin du jeu ne propose pas
	STATUS_NOT_ALLOWED = "STATUS_NOT_ALLOWED",
	// Une version jouée a un statut de fin : le type de fin du jeu ne peut plus être retiré, seulement changé
	ENDING_TYPE_REQUIRED = "ENDING_TYPE_REQUIRED",
	// Les jeux envoyés pour « Réorganiser la série » ne sont plus exactement ceux de la série
	SERIES_ENTRIES_MISMATCH = "SERIES_ENTRIES_MISMATCH",

	// ==== Films et séries ====
	// Sur TMDB : l'identifiant ne mène plus à aucun film ou série
	TMDB_MEDIA_NOT_FOUND = "TMDB_MEDIA_NOT_FOUND",
	// TMDB injoignable, ou réponse inattendue (clé refusée…) : l'action peut réussir plus tard
	TMDB_UNAVAILABLE = "TMDB_UNAVAILABLE",
	USER_MEDIA_NOT_FOUND = "USER_MEDIA_NOT_FOUND",
	USER_MEDIA_ALREADY_EXISTS = "USER_MEDIA_ALREADY_EXISTS",
	SAGA_NOT_FOUND = "SAGA_NOT_FOUND",
	// Les médias envoyés pour « Réorganiser la saga » ne sont plus exactement ceux de la saga
	SAGA_ENTRIES_MISMATCH = "SAGA_ENTRIES_MISMATCH",
	// Un épisode envoyé n'est pas un épisode de cette série
	EPISODE_NOT_IN_SHOW = "EPISODE_NOT_IN_SHOW",
	// « Vu » d'une série se coche par ses épisodes, jamais sur la série elle-même
	WATCHED_ONLY_FOR_MOVIES = "WATCHED_ONLY_FOR_MOVIES",
	// Le compte n'a aucun import en cours (fini, annulé, ou perdu au redémarrage du serveur)
	MEDIA_IMPORT_NOT_FOUND = "MEDIA_IMPORT_NOT_FOUND",
	// Un seul import à la fois par compte
	MEDIA_IMPORT_ALREADY_RUNNING = "MEDIA_IMPORT_ALREADY_RUNNING",
	// « Valider » avant que toutes les fiches soient lues, ou après l'échec de la lecture
	MEDIA_IMPORT_NOT_READY = "MEDIA_IMPORT_NOT_READY",
}

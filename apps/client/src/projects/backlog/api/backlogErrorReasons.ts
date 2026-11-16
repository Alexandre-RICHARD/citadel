import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum";

// Raisons des codes métier, après « Impossible de … : »
export const backlogErrorReasons: Record<BacklogErrorCodeEnum, string> = {
	[BacklogErrorCodeEnum.GAME_NOT_FOUND]: "ce jeu n'est plus en base",
	[BacklogErrorCodeEnum.VERSION_NOT_FOUND]: "cette version n'existe plus",
	[BacklogErrorCodeEnum.DLC_NOT_FOUND]: "ce DLC n'existe plus",
	[BacklogErrorCodeEnum.SERIES_NOT_FOUND]: "cette série n'existe plus",
	[BacklogErrorCodeEnum.USER_GAME_NOT_FOUND]:
		"ce jeu n'est plus dans le backlog",
	[BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND]:
		"cette version jouée n'existe plus",
	[BacklogErrorCodeEnum.IGDB_GAME_NOT_FOUND]: "ce jeu n'existe plus sur IGDB",
	[BacklogErrorCodeEnum.IGDB_UNAVAILABLE]: "IGDB ne répond pas",
	[BacklogErrorCodeEnum.GAME_ALREADY_STORED]: "ce jeu est déjà en base",
	[BacklogErrorCodeEnum.USER_GAME_ALREADY_EXISTS]:
		"ce jeu est déjà dans le backlog",
	[BacklogErrorCodeEnum.GAME_IN_A_BACKLOG]:
		"ce jeu est dans le backlog d'un compte",
	[BacklogErrorCodeEnum.USER_VERSION_ALREADY_EXISTS]:
		"cette version est déjà jouée sur cette plateforme",
	[BacklogErrorCodeEnum.PLATFORM_NOT_ALLOWED]:
		"cette plateforme n'est pas proposée pour cette version",
	[BacklogErrorCodeEnum.STATUS_NOT_ALLOWED]:
		"ce statut n'est pas proposé pour ce type de fin",
	[BacklogErrorCodeEnum.ENDING_TYPE_REQUIRED]:
		"une version jouée a un statut de fin : le type de fin ne peut plus être retiré",
	[BacklogErrorCodeEnum.SERIES_ENTRIES_MISMATCH]:
		"la série a changé entre-temps",
	[BacklogErrorCodeEnum.TMDB_MEDIA_NOT_FOUND]:
		"ce film ou cette série n'existe plus sur TMDB",
	[BacklogErrorCodeEnum.TMDB_UNAVAILABLE]: "TMDB ne répond pas",
	[BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND]:
		"ce média n'est plus dans le backlog",
	[BacklogErrorCodeEnum.USER_MEDIA_ALREADY_EXISTS]:
		"ce média est déjà dans le backlog",
	[BacklogErrorCodeEnum.SAGA_NOT_FOUND]: "cette saga n'existe plus",
	[BacklogErrorCodeEnum.SAGA_ENTRIES_MISMATCH]: "la saga a changé entre-temps",
	[BacklogErrorCodeEnum.EPISODE_NOT_IN_SHOW]:
		"cet épisode n'appartient pas à cette série",
	[BacklogErrorCodeEnum.WATCHED_ONLY_FOR_MOVIES]:
		"une série se coche épisode par épisode",
	[BacklogErrorCodeEnum.MEDIA_IMPORT_NOT_FOUND]: "aucun import n'est en cours",
	[BacklogErrorCodeEnum.MEDIA_IMPORT_ALREADY_RUNNING]:
		"un import est déjà en cours",
	[BacklogErrorCodeEnum.MEDIA_PASSWORD_INVALID]:
		"le mot de passe des médias est incorrect",
	[BacklogErrorCodeEnum.NAS_OWNER_ONLY]:
		"seul le compte du propriétaire du NAS ouvre le mode connecté",
	[BacklogErrorCodeEnum.NAS_LOCKED]:
		"le mode connecté est verrouillé, redonnez le mot de passe des médias",
	[BacklogErrorCodeEnum.NAS_SURVEY_UNAVAILABLE]:
		"le relevé du NAS est absent ou illisible, relancez le job depuis la console",
	[BacklogErrorCodeEnum.NOT_VERIFIABLE]:
		"ce média n'a pas de fichier, ou en a plusieurs",
	[BacklogErrorCodeEnum.MEDIA_IMPORT_NOT_READY]:
		"la lecture de la liste n'est pas terminée",
};

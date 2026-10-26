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
	[BacklogErrorCodeEnum.USER_VERSION_ALREADY_EXISTS]:
		"cette version est déjà jouée sur cette plateforme",
	[BacklogErrorCodeEnum.PLATFORM_NOT_ALLOWED]:
		"cette plateforme n'est pas proposée pour cette version",
	[BacklogErrorCodeEnum.STATUS_NOT_ALLOWED]:
		"ce statut n'est pas proposé pour ce type de fin",
	[BacklogErrorCodeEnum.SERIES_ENTRIES_MISMATCH]:
		"la série a changé entre-temps",
};

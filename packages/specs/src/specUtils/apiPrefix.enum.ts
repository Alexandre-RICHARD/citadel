export enum ApiPrefixEnum {
	GAME_DEATH_COUNTER = "/game-death-counter",
	BACKLOG = "/backlog",
	ERROR_LOG = "/error-log",
	SATISFACTORY = "/satisfactory",
	MAIL = "/mail",
	CONTACT = "/contact",
	// Hors d'Internet : Caddy ne transmet pas /api/internal, seule la console du NAS l'appelle, par le réseau Docker
	INTERNAL = "/internal",
}

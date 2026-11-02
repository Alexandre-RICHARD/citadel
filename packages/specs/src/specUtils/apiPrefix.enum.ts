export enum ApiPrefixEnum {
	GAME_DEATH_COUNTER = "/game-death-counter",
	BACKLOG = "/backlog",
	SATISFACTORY = "/satisfactory",
	MAIL = "/mail",
	CONTACT = "/contact",
	AUTH = "/auth",
	// Hors d'Internet : Caddy ne transmet pas /api/internal, seule la console du NAS l'appelle, par le réseau Docker
	INTERNAL = "/internal",
}

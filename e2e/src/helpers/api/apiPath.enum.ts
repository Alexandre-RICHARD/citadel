// Les routes de l'API, derrière Caddy (préfixe /api), pour les scénarios qui l'appellent directement (isolation entre comptes)
export enum ApiPathEnum {
	AUTH_LOGIN_PASSWORD = "/api/auth/login/password",
	AUTH_LOGOUT = "/api/auth/logout",
	AUTH_ME = "/api/auth/me",
	AUTH_SESSIONS = "/api/auth/sessions",
	AUTH_FACTORS = "/api/auth/factors",
	AUTH_EXPORT = "/api/auth/me/export",
	GDC_GAMES = "/api/game-death-counter/games",
	GDC_BOSSES = "/api/game-death-counter/bosses",
	GDC_DEATHS = "/api/game-death-counter/deaths",
	BACKLOG_USER_GAMES = "/api/backlog/user-games",
	BACKLOG_OVERVIEW = "/api/backlog/overview",
	BACKLOG_SERIES = "/api/backlog/series",
	BACKLOG_IGDB_SEARCH = "/api/backlog/igdb/search",
}

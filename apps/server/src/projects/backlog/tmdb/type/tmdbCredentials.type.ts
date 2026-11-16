// Comment une requête TMDB s'authentifie : en en-tête (jeton de lecture) ou dans l'adresse (clé d'API courte)
export type TmdbCredentials = {
	headers: Record<string, string>;
	query: Record<string, string>;
};

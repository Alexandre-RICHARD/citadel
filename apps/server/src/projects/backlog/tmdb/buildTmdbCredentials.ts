import type { TmdbCredentials } from "./type/tmdbCredentials.type.ts";

// Le jeton de lecture de TMDB est un JWT : il commence toujours ainsi
const READ_TOKEN_PREFIX = "eyJ";

/**
 * Le compte TMDB donne deux secrets, acceptés tous les deux : le jeton de lecture passe en en-tête, la clé d'API courte
 * seulement dans l'adresse. C'est pourquoi aucun message d'erreur ne cite l'adresse d'une requête TMDB
 */
export function buildTmdbCredentials(key: string): TmdbCredentials {
	return key.startsWith(READ_TOKEN_PREFIX)
		? { headers: { Authorization: `Bearer ${key}` }, query: {} }
		: { headers: {}, query: { api_key: key } };
}

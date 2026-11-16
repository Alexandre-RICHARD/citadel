import { fetchCachedTmdbMovie } from "./fetchCachedTmdbMovie.ts";
import { fetchCachedTmdbShow } from "./fetchCachedTmdbShow.ts";
import { fetchTmdbMovie } from "./fetchTmdbMovie.ts";
import { fetchTmdbPosterPaths } from "./fetchTmdbPosterPaths.ts";
import { fetchTmdbShow } from "./fetchTmdbShow.ts";
import { isKnownOnTmdb } from "./isKnownOnTmdb.ts";
import { searchTmdbMedia } from "./searchTmdbMedia.ts";

/**
 * Ce que les services demandent à TMDB. Un objet plutôt que des imports directs : les tests d'intégration remplacent
 * ces méthodes (vi.spyOn) et ne contactent jamais TMDB. Les versions « fresh » ignorent le cache : l'import et la
 * relecture des séries en cours veulent l'état du jour
 */
export const tmdbGateway = {
	searchMedia: searchTmdbMedia,
	fetchMovie: fetchCachedTmdbMovie,
	fetchShow: fetchCachedTmdbShow,
	fetchFreshMovie: fetchTmdbMovie,
	fetchFreshShow: fetchTmdbShow,
	fetchPosterPaths: fetchTmdbPosterPaths,
	isKnown: isKnownOnTmdb,
};

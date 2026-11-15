// TMDB (API v3), en français. La clé peut être la « clé d'API » courte ou le « jeton de lecture » (eyJ…),
// les deux étant donnés dans les paramètres du compte TMDB.
import { requireVariable } from "../lib/config.mjs";
import { mapWithConcurrency, requestJson } from "../lib/http.mjs";

const baseUrl = "https://api.themoviedb.org/3";
export const imageBaseUrl = "https://image.tmdb.org/t/p/original";
const concurrency = 10;

// Séries dont TMDB attend encore des épisodes : celles que le job media-tmdb relirait chaque semaine
const ongoingStatuses = new Set(["Returning Series", "In Production", "Planned", "Pilot"]);

export function createTmdbClient() {
	const key = requireVariable("TMDB_API_KEY");
	const isReadToken = key.startsWith("eyJ");

	async function get(path, parameters = {}) {
		const query = new URLSearchParams({ language: "fr-FR", ...parameters });
		if (!isReadToken) query.set("api_key", key);
		const headers = isReadToken ? { Authorization: `Bearer ${key}` } : {};
		return requestJson(`${baseUrl}${path}?${query}`, { headers });
	}

	const withImagesAndTranslations = {
		append_to_response: "images,translations,external_ids",
		include_image_language: "fr,en,null",
	};

	return {
		movie: (id) => get(`/movie/${id}`, withImagesAndTranslations),
		movieSummary: (id) => get(`/movie/${id}`),
		tv: (id) => get(`/tv/${id}`, withImagesAndTranslations),
		season: (tvId, seasonNumber) => get(`/tv/${tvId}/season/${seasonNumber}`),
		collection: (id) => get(`/collection/${id}`),
		searchTv: (query, year) => get("/search/tv", { query, ...(year ? { first_air_date_year: String(year) } : {}) }),
		async allSeasons(tv) {
			return mapWithConcurrency(tv.seasons ?? [], concurrency, (season) => this.season(tv.id, season.season_number));
		},
		mapAll: (items, mapper) => mapWithConcurrency(items, concurrency, mapper),
	};
}

export function isOngoing(tv) {
	return ongoingStatuses.has(tv.status) || tv.in_production === true;
}

export function frenchTranslation(media) {
	const french = media.translations?.translations?.find((translation) => translation.iso_639_1 === "fr");
	return french?.data?.title || french?.data?.name || undefined;
}

export function isAired(airDate, today = new Date().toISOString().slice(0, 10)) {
	return Boolean(airDate) && airDate <= today;
}

export function imageUrl(imagePath) {
	return imagePath ? `${imageBaseUrl}${imagePath}` : undefined;
}

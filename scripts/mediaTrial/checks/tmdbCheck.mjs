// Vérification 1 : tout ce que le cahier des charges attend de TMDB, sur la liste courte.
import { frenchTranslation, imageUrl, isAired, isOngoing } from "../clients/tmdb.mjs";
import { join } from "../lib/text.mjs";

const specialsSeason = 0;

function posterSummary(media) {
	const posters = media.images?.posters ?? [];
	const french = posters.filter((poster) => poster.iso_639_1 === "fr").length;
	return `${posters.length} (dont ${french} en français)`;
}

// Sans traduction française, TMDB donne le titre anglais : à signaler s'il n'est pas aussi le titre original
function titleAlerts(media, title, originalTitle) {
	const french = frenchTranslation(media);
	return [
		!french && title !== originalTitle ? `pas de titre français : TMDB donne « ${title} »` : undefined,
		!media.poster_path ? "pas d'affiche" : undefined,
		title === undefined || originalTitle === undefined ? "titre manquant" : undefined,
	];
}

function movieRow(movie) {
	return {
		type: "Film",
		tmdbId: movie.id,
		imdbId: movie.external_ids?.imdb_id ?? movie.imdb_id,
		title: movie.title,
		originalTitle: movie.original_title,
		titlesDiffer: movie.title !== movie.original_title ? "oui" : "non",
		language: movie.original_language,
		release: movie.release_date,
		runtime: movie.runtime || undefined,
		status: movie.status,
		posters: posterSummary(movie),
		poster: imageUrl(movie.poster_path),
		collection: movie.belongs_to_collection ? `${movie.belongs_to_collection.id} · ${movie.belongs_to_collection.name}` : undefined,
		alerts: join([...titleAlerts(movie, movie.title, movie.original_title), movie.runtime ? undefined : "durée inconnue"]),
	};
}

function episodeRows(tv, seasons) {
	return seasons.flatMap((season) =>
		(season.episodes ?? []).map((episode) => ({
			series: tv.name,
			tmdbId: tv.id,
			season: season.season_number === specialsSeason ? "Épisodes spéciaux" : season.season_number,
			episode: episode.episode_number,
			name: episode.name,
			airDate: episode.air_date,
			aired: isAired(episode.air_date) ? "oui" : "non (hors progression)",
			runtime: episode.runtime ?? undefined,
			still: imageUrl(episode.still_path),
			alerts: join([
				episode.runtime ? undefined : "durée inconnue",
				/^(épisode|episode) \d+$/i.test(episode.name ?? "") ? "pas de titre français" : undefined,
			]),
		})),
	);
}

function seriesRow(tv, seasons) {
	const regular = seasons.filter((season) => season.season_number !== specialsSeason).flatMap((season) => season.episodes ?? []);
	const specials = seasons.find((season) => season.season_number === specialsSeason)?.episodes ?? [];
	const aired = regular.filter((episode) => isAired(episode.air_date));
	const missingRuntime = regular.filter((episode) => !episode.runtime).length;
	return {
		type: "Série",
		tmdbId: tv.id,
		imdbId: tv.external_ids?.imdb_id,
		title: tv.name,
		originalTitle: tv.original_name,
		titlesDiffer: tv.name !== tv.original_name ? "oui" : "non",
		language: tv.original_language,
		release: tv.first_air_date,
		runtime: regular.reduce((total, episode) => total + (episode.runtime ?? 0), 0) || undefined,
		status: tv.status,
		ongoing: isOngoing(tv) ? "en cours" : "finie",
		nextEpisode: tv.next_episode_to_air ? `S${tv.next_episode_to_air.season_number}E${tv.next_episode_to_air.episode_number} le ${tv.next_episode_to_air.air_date}` : undefined,
		seasons: seasons.filter((season) => season.season_number !== specialsSeason).length,
		episodes: `${aired.length} diffusés / ${regular.length}`,
		specials: specials.length,
		posters: posterSummary(tv),
		poster: imageUrl(tv.poster_path),
		alerts: join([...titleAlerts(tv, tv.name, tv.original_name), missingRuntime ? `${missingRuntime} épisodes sans durée` : undefined]),
	};
}

// Une saga proposée par collection TMDB, numérotée dans l'ordre des dates de sortie (§4)
function collectionRows(collection) {
	return [...(collection.parts ?? [])]
		.sort((first, second) => (first.release_date || "9999").localeCompare(second.release_date || "9999"))
		.map((part, index) => ({
			collectionId: collection.id,
			collection: collection.name,
			number: index + 1,
			tmdbId: part.id,
			title: part.title,
			originalTitle: part.original_title,
			release: part.release_date || "inconnue",
		}));
}

export async function runTmdbCheck({ tmdb, report, shortList }) {
	const fetched = await report.time(
		"1. TMDB : fiches de la liste courte",
		() =>
			tmdb.mapAll(shortList, async ({ type, id }) => {
				try {
					if (type === "movie") return { type, media: await tmdb.movie(id) };
					const tv = await tmdb.tv(id);
					return { type, media: tv, seasons: await tmdb.allSeasons(tv) };
				} catch (error) {
					return { type, id, error: error.message };
				}
			}),
		(results) => `${results.length} médias`,
	);

	const collectionIds = [...new Set(fetched.map((item) => item.media?.belongs_to_collection?.id).filter(Boolean))];
	const collections = await report.time(
		"1. TMDB : collections",
		() => tmdb.mapAll(collectionIds, (id) => tmdb.collection(id)),
		(results) => `${results.length} collections`,
	);

	const mediaRows = fetched.map((item) => {
		if (item.error) return { type: item.type === "movie" ? "Film" : "Série", tmdbId: item.id, alerts: item.error };
		return item.type === "movie" ? movieRow(item.media) : seriesRow(item.media, item.seasons);
	});

	report.addSheet(
		"1 TMDB médias",
		[
			{ key: "type", header: "Type" },
			{ key: "tmdbId", header: "TMDB" },
			{ key: "imdbId", header: "IMDB" },
			{ key: "title", header: "Titre", width: 35 },
			{ key: "originalTitle", header: "Titre original", width: 35 },
			{ key: "titlesDiffer", header: "Titres différents" },
			{ key: "language", header: "Langue originale" },
			{ key: "release", header: "Sortie / 1re diffusion" },
			{ key: "runtime", header: "Durée (min)" },
			{ key: "status", header: "Statut TMDB" },
			{ key: "ongoing", header: "En cours ou finie" },
			{ key: "nextEpisode", header: "Prochain épisode", width: 25 },
			{ key: "seasons", header: "Saisons" },
			{ key: "episodes", header: "Épisodes", width: 20 },
			{ key: "specials", header: "Épisodes spéciaux" },
			{ key: "posters", header: "Affiches", width: 22 },
			{ key: "poster", header: "Affiche par défaut", width: 40 },
			{ key: "collection", header: "Collection TMDB", width: 35 },
			{ key: "alerts", header: "Alertes", width: 50 },
		],
		mediaRows,
	);

	report.addSheet(
		"1 TMDB épisodes",
		[
			{ key: "series", header: "Série", width: 30 },
			{ key: "tmdbId", header: "TMDB" },
			{ key: "season", header: "Saison", width: 18 },
			{ key: "episode", header: "Épisode" },
			{ key: "name", header: "Titre", width: 35 },
			{ key: "airDate", header: "Diffusion" },
			{ key: "aired", header: "Diffusé", width: 22 },
			{ key: "runtime", header: "Durée (min)" },
			{ key: "still", header: "Image", width: 40 },
			{ key: "alerts", header: "Alertes", width: 30 },
		],
		fetched.filter((item) => item.type === "tv" && item.media).flatMap((item) => episodeRows(item.media, item.seasons)),
	);

	report.addSheet(
		"1 TMDB sagas",
		[
			{ key: "collectionId", header: "Collection" },
			{ key: "collection", header: "Nom", width: 35 },
			{ key: "number", header: "Numéro proposé" },
			{ key: "tmdbId", header: "TMDB" },
			{ key: "title", header: "Titre", width: 35 },
			{ key: "originalTitle", header: "Titre original", width: 35 },
			{ key: "release", header: "Sortie" },
		],
		collections.flatMap(collectionRows),
	);
}

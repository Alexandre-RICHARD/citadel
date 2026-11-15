// Radarr et Sonarr, par le LAN. Tous deux démarrent à la demande : s'ils sont arrêtés, les démarrer depuis la
// console avant de lancer le script.
import { requireVariable } from "../lib/config.mjs";
import { mapWithConcurrency, requestJson } from "../lib/http.mjs";

function createArrClient(name, nasHost, port, keyVariable) {
	const key = requireVariable(keyVariable);
	const baseUrl = `http://${nasHost}:${port}/api/v3`;
	return async function get(path, parameters = {}) {
		const query = new URLSearchParams(parameters);
		try {
			return await requestJson(`${baseUrl}${path}?${query}`, { headers: { "X-Api-Key": key } });
		} catch (error) {
			throw new Error(`${name} : ${error.message} (est-il démarré ? la console le démarre)`);
		}
	};
}

export function createRadarrClient(nasHost) {
	const get = createArrClient("Radarr", nasHost, 7878, "RADARR_API_KEY");
	return {
		movies: () => get("/movie"),
		queue: () => get("/queue", { pageSize: "1000", includeMovie: "false" }),
	};
}

export function createSonarrClient(nasHost) {
	const get = createArrClient("Sonarr", nasHost, 8989, "SONARR_API_KEY");
	return {
		series: () => get("/series"),
		queue: () => get("/queue", { pageSize: "1000" }),
		// Épisodes et fichiers de chaque série, par série : Sonarr ne les donne pas en une fois
		async episodesAndFiles(seriesList) {
			return mapWithConcurrency(seriesList, 4, async (series) => ({
				series,
				episodes: await get("/episode", { seriesId: String(series.id) }),
				files: await get("/episodefile", { seriesId: String(series.id) }),
			}));
		},
	};
}

// qBittorrent (API WebUI v2), par le LAN, en lecture seule : aucune étiquette n'est posée, aucun tracker ajouté.
import { requireVariable } from "../lib/config.mjs";
import { mapWithConcurrency, request, requestJson } from "../lib/http.mjs";

// Entrées de la liste des trackers qui n'en sont pas : DHT, PeX et LSD
const isRealTracker = (tracker) => !tracker.url.startsWith("** [");

export function createQbittorrentClient(nasHost) {
	const baseUrl = `http://${nasHost}:8080`;
	let cookie;

	// qBittorrent refuse une connexion dont le Referer n'est pas sa propre adresse
	async function login() {
		const body = new URLSearchParams({ username: requireVariable("QBITTORRENT_USER"), password: requireVariable("QBITTORRENT_PASSWORD") });
		const response = await request(`${baseUrl}/api/v2/auth/login`, { method: "POST", body, headers: { Referer: baseUrl } });
		cookie = response.headers.getSetCookie().find((value) => value.startsWith("SID="))?.split(";")[0];
		if (!cookie) throw new Error("qBittorrent : connexion refusée (QBITTORRENT_USER, QBITTORRENT_PASSWORD)");
	}

	const get = (path, parameters = {}) =>
		requestJson(`${baseUrl}/api/v2${path}?${new URLSearchParams(parameters)}`, { headers: { Cookie: cookie, Referer: baseUrl } });

	return {
		async torrentsWithFilesAndTrackers() {
			await login();
			const torrents = await get("/torrents/info");
			return mapWithConcurrency(torrents, 8, async (torrent) => ({
				torrent,
				files: await get("/torrents/files", { hash: torrent.hash }),
				trackers: (await get("/torrents/trackers", { hash: torrent.hash })).filter(isRealTracker),
			}));
		},
	};
}

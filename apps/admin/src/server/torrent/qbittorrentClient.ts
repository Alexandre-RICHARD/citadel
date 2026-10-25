import { env } from "../configuration/env.ts";
import { fetchWithTimeout } from "../http/fetchWithTimeout.ts";

// L'API web de qBittorrent, joint par le réseau de Gluetun (media-gluetun:8080), avec ton
// compte qBittorrent (QBITTORRENT_USER et QBITTORRENT_PASSWORD de .env.prod).
// Connexion : un cookie SID, gardé tant que qBittorrent l'accepte, refait sinon.

let sessionCookie: string | null = null;

async function login(): Promise<string> {
	const response = await fetchWithTimeout(
		`${env.QBITTORRENT_URL}/api/v2/auth/login`,
		{
			method: "POST",
			body: new URLSearchParams({
				username: env.QBITTORRENT_USER,
				password: env.QBITTORRENT_PASSWORD,
			}),
		},
	);
	const sid = response.headers
		.getSetCookie()
		.find((cookie) => cookie.startsWith("SID="))
		?.split(";")[0];
	// qBittorrent répond « Fails. » (200) à un mauvais mot de passe, 403 s'il a banni l'IP
	if (!response.ok || !sid)
		throw new Error(
			"identifiants refusés (QBITTORRENT_USER, QBITTORRENT_PASSWORD)",
		);
	return sid;
}

async function request(path: string, retry = true): Promise<Response> {
	sessionCookie ??= await login();
	const response = await fetchWithTimeout(`${env.QBITTORRENT_URL}${path}`, {
		headers: { Cookie: sessionCookie },
	});
	// Session expirée (ou qBittorrent redémarré) : une nouvelle connexion, une seule fois
	if (response.status === 403 && retry) {
		sessionCookie = null;
		return request(path, false);
	}
	if (!response.ok) throw new Error(`réponse ${response.status}`);
	return response;
}

export const qbittorrentClient = {
	async getJson<T>(path: string): Promise<T> {
		return (await (await request(path)).json()) as T;
	},
};

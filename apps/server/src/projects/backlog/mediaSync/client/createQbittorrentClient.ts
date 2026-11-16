import { mapWithConcurrency } from "@citadel/common/src/universal/async/mapWithConcurrency.ts";
import { z } from "zod";

import { requestJson } from "../http/requestJson.ts";
import { requestWithRetry } from "../http/requestWithRetry.ts";
import type { QbittorrentClient } from "./qbittorrentClient.type.ts";
import { qbittorrentTorrentSchema } from "./qbittorrentTorrentSchema.ts";
import { qbittorrentTrackerSchema } from "./qbittorrentTrackerSchema.ts";

const CONCURRENCY = 8;
// Les étiquettes se posent par paquets : une adresse de plusieurs milliers de hashs dépasserait les limites
const TAG_BATCH_SIZE = 100;

// Les lignes de la liste des trackers qui n'en sont pas : DHT, PeX et LSD
function isRealTracker({ url }: { url: string }): boolean {
	return !url.startsWith("** [");
}

/**
 * qBittorrent (API WebUI v2), par le réseau de Gluetun (media-gluetun:8080). Sa seule écriture : l'étiquette
 * tracker-invalide, posée et retirée (§8, étape 2). qBittorrent refuse une requête dont le Referer n'est pas son adresse
 */
export function createQbittorrentClient({
	url,
	user,
	password,
}: {
	url: string;
	user: string;
	password: string;
}): QbittorrentClient {
	let cookie: string | null = null;

	async function login(): Promise<string> {
		const response = await requestWithRetry(
			"qBittorrent",
			`${url}/api/v2/auth/login`,
			{
				method: "POST",
				body: new URLSearchParams({ username: user, password }),
				headers: { Referer: url },
			},
		);
		const sessionCookie = response.headers
			.getSetCookie()
			.find((value) => value.startsWith("SID="))
			?.split(";")
			.at(0);
		if (sessionCookie === undefined)
			throw new Error(
				"qBittorrent : connexion refusée (QBITTORRENT_USER, QBITTORRENT_PASSWORD)",
			);
		return sessionCookie;
	}

	async function headers(): Promise<Record<string, string>> {
		cookie ??= await login();
		return { Cookie: cookie, Referer: url };
	}

	async function get<Schema extends z.ZodType>(
		path: string,
		schema: Schema,
		parameters: Record<string, string> = {},
	): Promise<z.infer<Schema>> {
		return requestJson(
			"qBittorrent",
			`${url}/api/v2${path}?${new URLSearchParams(parameters).toString()}`,
			schema,
			{ headers: await headers() },
		);
	}

	async function changeTag(
		action: "addTags" | "removeTags",
		hashes: string[],
		tag: string,
	): Promise<void> {
		for (let start = 0; start < hashes.length; start += TAG_BATCH_SIZE)
			// eslint-disable-next-line no-await-in-loop -- un paquet après l'autre, sans presser qBittorrent
			await requestWithRetry(
				"qBittorrent",
				`${url}/api/v2/torrents/${action}`,
				{
					method: "POST",
					body: new URLSearchParams({
						hashes: hashes.slice(start, start + TAG_BATCH_SIZE).join("|"),
						tags: tag,
					}),
					// eslint-disable-next-line no-await-in-loop -- idem
					headers: await headers(),
				},
			);
	}

	return {
		async entries() {
			const torrents = await get(
				"/torrents/info",
				z.array(qbittorrentTorrentSchema),
			);
			return mapWithConcurrency(torrents, CONCURRENCY, async (torrent) => {
				const [files, trackers] = await Promise.all([
					get("/torrents/files", z.array(z.object({ name: z.string() })), {
						hash: torrent.hash,
					}),
					get("/torrents/trackers", z.array(qbittorrentTrackerSchema), {
						hash: torrent.hash,
					}),
				]);
				return {
					torrent,
					fileNames: files.map(({ name }) => name),
					trackers: trackers.filter(isRealTracker),
				};
			});
		},
		addTag: (hashes, tag) => changeTag("addTags", hashes, tag),
		removeTag: (hashes, tag) => changeTag("removeTags", hashes, tag),
	};
}

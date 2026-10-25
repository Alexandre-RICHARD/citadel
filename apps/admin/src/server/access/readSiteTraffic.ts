import type { SiteTraffic } from "../../shared/siteTraffic.type.ts";
import { env } from "../configuration/env.ts";
import { demuxDockerLogs } from "../docker/demuxDockerLogs.ts";
import { dockerRequest } from "../docker/dockerRequest.ts";
import { summarizeAccessLog } from "./summarizeAccessLog.ts";

const WINDOW_HOURS = 24;
// Au plus 5 000 requêtes (environ 2 Mo) : au-delà, les totaux sont marqués partiels
const LINE_LIMIT = 5000;
// Plusieurs onglets ouverts ne relisent pas les logs plus d'une fois toutes les 30 s
const CACHE_MS = 30_000;

let cache: { readAt: number; value: SiteTraffic } | null = null;

// Le log d'accès de Caddy, c'est sa sortie standard (Caddyfile, bloc access_log) : lu
// par l'API de Docker, à travers le filtre, comme les logs de la fenêtre « Logs ».
// Ses propres messages (certificats…) vont sur la sortie d'erreur, ignorée ici.
export async function readSiteTraffic(): Promise<SiteTraffic> {
	if (cache && Date.now() - cache.readAt < CACHE_MS) return cache.value;
	try {
		const since = Math.floor(Date.now() / 1000) - WINDOW_HOURS * 3600;
		const response = await dockerRequest(
			`/containers/${encodeURIComponent(env.CADDY_CONTAINER)}/logs?stdout=true&stderr=false&since=${since}&tail=${LINE_LIMIT}`,
		);
		// Caddy tourne sans terminal : flux découpé en trames
		const text = demuxDockerLogs(
			Buffer.from(await response.arrayBuffer()),
			false,
		);
		const value = summarizeAccessLog(text, WINDOW_HOURS, LINE_LIMIT);
		cache = { readAt: Date.now(), value };
		return value;
	} catch {
		return { available: false, reason: "Logs de Caddy illisibles" };
	}
}

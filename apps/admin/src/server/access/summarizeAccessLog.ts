import type { AccessEntry } from "../../shared/accessEntry.type.ts";
import type { IpActivity } from "../../shared/ipActivity.type.ts";
import type { SiteTraffic } from "../../shared/siteTraffic.type.ts";
import { isSuspiciousPath } from "./isSuspiciousPath.ts";

const TOP_IP_LIMIT = 5;
const RECENT_LIMIT = 15;

// Ce qu'une page charge en plus d'elle-même : sans intérêt dans « dernières requêtes »
const STATIC_EXTENSIONS = new Set([
	"js",
	"css",
	"map",
	"png",
	"jpg",
	"jpeg",
	"gif",
	"svg",
	"ico",
	"webp",
	"avif",
	"woff",
	"woff2",
	"json",
	"txt",
	"webmanifest",
]);

// Une ligne du log d'accès de Caddy (Caddyfile, bloc access_log)
type CaddyAccessLine = {
	logger?: string;
	ts?: number;
	status?: number;
	// Ajouté par log_append : l'en-tête Cf-Ipcountry de Cloudflare
	country?: string;
	request?: {
		client_ip?: string;
		remote_ip?: string;
		method?: string;
		host?: string;
		uri?: string;
	};
};

// Caddy écrit une chaîne vide pour une valeur absente (pas d'en-tête Cf-Ipcountry…)
function nonEmpty(value: string | undefined): string | null {
	return value === undefined || value === "" ? null : value;
}

function parseLine(line: string): AccessEntry | null {
	let parsed: CaddyAccessLine;
	try {
		parsed = JSON.parse(line) as CaddyAccessLine;
	} catch {
		return null;
	}
	const request = parsed.request;
	if (!parsed.logger?.startsWith("http.log.access") || !request) return null;
	return {
		at: new Date((parsed.ts ?? 0) * 1000).toISOString(),
		// client_ip : l'IP réelle, derrière Cloudflare (trusted_proxies du Caddyfile)
		ip: nonEmpty(request.client_ip) ?? nonEmpty(request.remote_ip) ?? "?",
		// Vide hors Cloudflare ; « XX » : pays inconnu de Cloudflare
		country: nonEmpty(parsed.country),
		method: request.method ?? "",
		host: request.host ?? "",
		path: request.uri ?? "",
		status: parsed.status ?? 0,
	};
}

function isStaticFile(uri: string): boolean {
	const path = uri.split("?")[0] ?? "";
	const lastSegment = path.slice(path.lastIndexOf("/") + 1);
	const dot = lastSegment.lastIndexOf(".");
	return (
		dot !== -1 &&
		STATIC_EXTENSIONS.has(lastSegment.slice(dot + 1).toLowerCase())
	);
}

// Jellyfin, ses applications l'interrogent sans arrêt : elles noieraient le site
function isJellyfin(entry: AccessEntry): boolean {
	return entry.host.startsWith("jellyfin.");
}

// Le log d'accès de Caddy (une ligne JSON par requête, la plus ancienne d'abord), résumé
// pour la console : volumes, IP les plus actives, scans, dernières requêtes
export function summarizeAccessLog(
	text: string,
	windowHours: number,
	lineLimit: number,
): SiteTraffic {
	const lines = text.split("\n").filter((line) => line.trim() !== "");
	const entries = lines
		.map(parseLine)
		.filter((entry) => entry !== null)
		.reverse();

	const byIp = new Map<string, IpActivity>();
	const recentRequests: AccessEntry[] = [];
	const recentScans: AccessEntry[] = [];
	let scanCount = 0;

	for (const entry of entries) {
		const scan = isSuspiciousPath(entry.path);
		const activity = byIp.get(entry.ip) ?? {
			ip: entry.ip,
			country: entry.country,
			requestCount: 0,
			scanCount: 0,
		};
		activity.requestCount += 1;
		if (scan) {
			activity.scanCount += 1;
			scanCount += 1;
			if (recentScans.length < RECENT_LIMIT) recentScans.push(entry);
		} else if (
			recentRequests.length < RECENT_LIMIT &&
			!isJellyfin(entry) &&
			!isStaticFile(entry.path)
		)
			recentRequests.push(entry);
		byIp.set(entry.ip, activity);
	}

	return {
		available: true,
		windowHours,
		requestCount: entries.length,
		uniqueIpCount: byIp.size,
		scanCount,
		truncated: lines.length >= lineLimit,
		topIps: [...byIp.values()]
			.sort((first, second) => second.requestCount - first.requestCount)
			.slice(0, TOP_IP_LIMIT),
		recentRequests,
		recentScans,
	};
}

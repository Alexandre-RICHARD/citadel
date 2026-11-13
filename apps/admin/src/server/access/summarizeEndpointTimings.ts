import type { AccessEntry } from "../../shared/accessEntry.type.ts";
import type { EndpointTiming } from "../../shared/endpointTiming.type.ts";
import { normalizeEndpointPath } from "./normalizeEndpointPath.ts";

const API_PREFIX = "/api/";
const MEDIAN_RANK = 0.5;
const P95_RANK = 0.95;

// Plus petite valeur qui couvre la part demandée des durées (« rang le plus proche ») ; `sorted` : croissant, non vide
function percentile(sorted: number[], rank: number): number {
	return sorted[Math.max(0, Math.ceil(rank * sorted.length) - 1)] ?? 0;
}

// Jellyfin et ses applications ne sont pas le site
function isSiteApiRequest(entry: AccessEntry): boolean {
	return (
		entry.durationMs !== null &&
		!entry.host.startsWith("jellyfin.") &&
		entry.path.startsWith(API_PREFIX)
	);
}

/**
 * Le temps de réponse de chaque endpoint de l'API du site, du plus lent au plus rapide (95e centile). Les scans (chemins
 * inventés qui répondent 404) ne forment pas des endpoints : seuls les chemins qui ont répondu autre chose que 404 comptent
 */
export function summarizeEndpointTimings(
	entries: AccessEntry[],
	limit: number,
): EndpointTiming[] {
	const durationsByEndpoint = new Map<string, number[]>();
	for (const entry of entries.filter(isSiteApiRequest)) {
		if (entry.status === 404 || entry.durationMs === null) continue;
		const endpoint = `${entry.method} ${normalizeEndpointPath(entry.path)}`;
		durationsByEndpoint.set(endpoint, [
			...(durationsByEndpoint.get(endpoint) ?? []),
			entry.durationMs,
		]);
	}
	return [...durationsByEndpoint.entries()]
		.map(([endpoint, durations]): EndpointTiming => {
			const sorted = durations.toSorted((first, second) => first - second);
			return {
				endpoint,
				requestCount: sorted.length,
				medianMs: percentile(sorted, MEDIAN_RANK),
				p95Ms: percentile(sorted, P95_RANK),
				maxMs: sorted.at(-1) ?? 0,
			};
		})
		.toSorted((first, second) => second.p95Ms - first.p95Ms)
		.slice(0, limit);
}

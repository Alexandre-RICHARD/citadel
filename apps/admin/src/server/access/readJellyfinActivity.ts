import type { JellyfinActivity } from "../../shared/jellyfinActivity.type.ts";
import { env } from "../configuration/env.ts";
import { fetchWithTimeout } from "../http/fetchWithTimeout.ts";
import type { JellyfinSession } from "./jellyfinSession.type.ts";
import { parseJellyfinSessions } from "./parseJellyfinSessions.ts";

// Appareils actifs ces 10 dernières minutes
const ACTIVE_WITHIN_SECONDS = 600;

// L'API de Jellyfin (media-jellyfin:8096, par le réseau edge), avec une clé créée dans
// Jellyfin pour la console (JELLYFIN_API_KEY de .env.prod)
export async function readJellyfinActivity(): Promise<JellyfinActivity> {
	let response: Response;
	try {
		response = await fetchWithTimeout(
			`${env.JELLYFIN_URL}/Sessions?activeWithinSeconds=${ACTIVE_WITHIN_SECONDS}`,
			{
				headers: {
					Authorization: `MediaBrowser Token="${env.JELLYFIN_API_KEY}"`,
				},
			},
		);
	} catch {
		// Jellyfin est « à la demande » : arrêté, c'est normal
		return { available: false, reason: "Jellyfin arrêté ou injoignable" };
	}
	if (response.status === 401 || response.status === 403)
		return {
			available: false,
			reason: "Jellyfin : clé d'API refusée (JELLYFIN_API_KEY)",
		};
	if (!response.ok)
		return {
			available: false,
			reason: `Jellyfin : réponse ${response.status}`,
		};
	return parseJellyfinSessions((await response.json()) as JellyfinSession[]);
}

import type { DeadlineItem } from "../../shared/deadlineItem.type.ts";
import { env } from "../configuration/env.ts";
import { fetchWithTimeout } from "../http/fetchWithTimeout.ts";

const LABEL = "Token IGDB (Backlog)";
// Twitch demande de valider un token au plus une fois par heure
const CACHE_MS = 3_600_000;

let cache: { readAt: number; item: DeadlineItem } | null = null;

// Le token IGDB est un token d'application Twitch : son API de validation donne le
// nombre de secondes qu'il lui reste. Il ne se renouvelle pas seul : à refaire à la main
// sur dev.twitch.tv, puis dans .env.prod.
async function validate(): Promise<DeadlineItem> {
	let response: Response;
	try {
		response = await fetchWithTimeout("https://id.twitch.tv/oauth2/validate", {
			headers: { Authorization: `OAuth ${env.INTERNET_GAME_DATA_BASE_TOKEN}` },
		});
	} catch {
		return { label: LABEL, expiresAt: null, problem: "Twitch injoignable" };
	}
	if (response.status === 401)
		return {
			label: LABEL,
			expiresAt: null,
			problem: "refusé par Twitch : expiré ou révoqué",
		};
	if (!response.ok)
		return {
			label: LABEL,
			expiresAt: null,
			problem: `Twitch : réponse ${response.status}`,
		};
	const { expires_in: expiresIn } = (await response.json()) as {
		expires_in?: number;
	};
	return {
		label: LABEL,
		// 0 : un token sans expiration
		expiresAt: expiresIn
			? new Date(Date.now() + expiresIn * 1000).toISOString()
			: null,
		problem: null,
	};
}

export async function readIgdbTokenExpiry(): Promise<DeadlineItem> {
	if (cache && Date.now() - cache.readAt < CACHE_MS) return cache.item;
	const item = await validate();
	// Une panne réseau se réessaie à la lecture suivante, pas dans une heure
	if (item.problem !== "Twitch injoignable")
		cache = { readAt: Date.now(), item };
	return item;
}

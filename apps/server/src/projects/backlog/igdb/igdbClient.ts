import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";

import { env } from "../../../configuration/env.ts";
import { BadGatewayError } from "../../../error/BadGatewayError.ts";
import type { TwitchToken } from "./type/twitchToken.type.ts";

const IGDB_API_URL = "https://api.igdb.com/v4";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
// IGDB accepte 4 requêtes par seconde : un peu plus d'un quart de seconde entre deux départs
const REQUEST_GAP_MS = 260;
const REQUEST_TIMEOUT_MS = 10_000;
// Un token se renouvelle une minute avant l'expiration annoncée par Twitch (environ 60 jours)
const TOKEN_RENEWAL_MARGIN_MS = 60_000;
const SECOND_MS = 1000;
const HTTP_UNAUTHORIZED = 401;

type CachedToken = {
	accessToken: string;
	expiresAt: number;
};

function unavailable(message: string, cause?: unknown): BadGatewayError {
	return new BadGatewayError(BacklogErrorCodeEnum.IGDB_UNAVAILABLE, message, {
		cause,
	});
}

/**
 * Seul point de passage vers IGDB. Le token d'application vient de Twitch (client credentials, avec le Client-ID et le
 * secret du .env) : demandé au premier appel, gardé en mémoire, redemandé avant son expiration ou s'il est refusé.
 * Toute réponse inattendue devient une BadGatewayError IGDB_UNAVAILABLE ; le secret n'apparaît dans aucun message
 */
class IgdbClient {
	#tokenRequest: Promise<CachedToken> | null = null;

	#nextRequestAt = 0;

	// Requête Apicalypse en texte brut sur un endpoint IGDB (`games`, `game_types`…)
	async request<Result>(endpoint: string, body: string): Promise<Result> {
		const response = await this.#send(endpoint, body);
		if (response.status !== HTTP_UNAUTHORIZED)
			return this.#read<Result>(response, endpoint);

		// Token révoqué ou expiré plus tôt qu'annoncé : un seul nouvel essai, avec un token neuf
		this.#tokenRequest = null;
		return this.#read<Result>(await this.#send(endpoint, body), endpoint);
	}

	async #send(endpoint: string, body: string): Promise<Response> {
		const { accessToken } = await this.#getToken();
		await this.#waitForSlot();
		try {
			return await fetch(`${IGDB_API_URL}/${endpoint}`, {
				method: "POST",
				headers: {
					"Client-ID": env.INTERNET_GAME_DATA_BASE_CLIENT_ID,
					"Authorization": `Bearer ${accessToken}`,
				},
				body,
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			});
		} catch (error) {
			throw unavailable(`IGDB did not answer on ${endpoint}`, error);
		}
	}

	async #read<Result>(response: Response, endpoint: string): Promise<Result> {
		if (!response.ok)
			throw unavailable(`IGDB answered ${response.status} on ${endpoint}`);
		try {
			return (await response.json()) as Result;
		} catch (error) {
			throw unavailable(`IGDB sent an unreadable body on ${endpoint}`, error);
		}
	}

	// Chaque requête prend le créneau suivant, réservé avant toute attente : des appels simultanés partent à la suite
	async #waitForSlot(): Promise<void> {
		const now = Date.now();
		const startAt = Math.max(now, this.#nextRequestAt);
		this.#nextRequestAt = startAt + REQUEST_GAP_MS;
		if (startAt > now)
			await new Promise((resolve) => {
				setTimeout(resolve, startAt - now);
			});
	}

	// Des appels simultanés partagent la même demande de token ; une demande échouée est refaite au prochain appel
	async #getToken(): Promise<CachedToken> {
		const token = await this.#tokenRequest?.catch(() => null);
		if (token && token.expiresAt > Date.now()) return token;

		this.#tokenRequest = this.#requestToken();
		return this.#tokenRequest;
	}

	async #requestToken(): Promise<CachedToken> {
		let response: Response;
		try {
			response = await fetch(TWITCH_TOKEN_URL, {
				method: "POST",
				// Dans le corps plutôt que dans l'URL : une URL finit plus facilement dans un log
				body: new URLSearchParams({
					client_id: env.INTERNET_GAME_DATA_BASE_CLIENT_ID,
					client_secret: env.INTERNET_GAME_DATA_BASE_CLIENT_SECRET,
					grant_type: "client_credentials",
				}),
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			});
		} catch (error) {
			throw unavailable("Twitch did not answer the IGDB token request", error);
		}
		if (!response.ok)
			throw unavailable(
				`Twitch refused the IGDB token request (${response.status}): check the client id and secret`,
			);

		const token = (await response.json()) as TwitchToken;
		return {
			accessToken: token.access_token,
			expiresAt:
				Date.now() + token.expires_in * SECOND_MS - TOKEN_RENEWAL_MARGIN_MS,
		};
	}
}

export const igdbClient = new IgdbClient();

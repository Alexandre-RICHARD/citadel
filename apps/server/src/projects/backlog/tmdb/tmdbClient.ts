import { wait } from "@citadel/common/src/universal/async/wait.ts";
import { fetchWithTimeout } from "@citadel/common/src/universal/http/fetchWithTimeout.ts";
import { createRequestPacer } from "@citadel/common/src/universal/limit/createRequestPacer.ts";
import { externalLinks } from "@citadel/specs/src/links/externalLinks.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";

import { env } from "../../../configuration/env.ts";
import { BadGatewayError } from "../../../error/BadGatewayError.ts";
import { buildTmdbCredentials } from "./buildTmdbCredentials.ts";
import { getTmdbRetryDelayMs } from "./getTmdbRetryDelayMs.ts";

// TMDB accepte de l'ordre de 50 requêtes par seconde : 20 par seconde restent nettement en dessous, même pendant
// l'import de plusieurs milliers de films (docs/backlog/backlog_media.md, §7.2)
const REQUEST_GAP_MS = 50;
const REQUEST_TIMEOUT_MS = 10_000;
// Une requête refusée pour excès de débit (429) est rejouée, trois fois au plus
const MAX_ATTEMPTS = 4;
const HTTP_NOT_FOUND = 404;
const HTTP_TOO_MANY_REQUESTS = 429;
// Les titres en français, quand TMDB en a un ; sinon TMDB donne l'original
const LANGUAGE = "fr-FR";

function unavailable(message: string, cause?: unknown): BadGatewayError {
	return new BadGatewayError(BacklogErrorCodeEnum.TMDB_UNAVAILABLE, message, {
		cause,
	});
}

/**
 * Seul point de passage vers l'API de TMDB. Les messages d'erreur ne citent que le chemin, jamais l'adresse complète,
 * qui peut contenir la clé. Une fiche absente (404) n'est pas une erreur : `get` rend null
 */
class TmdbClient {
	#pacer = createRequestPacer(REQUEST_GAP_MS);

	async get<Result>(
		path: string,
		parameters: Record<string, string> = {},
	): Promise<Result | null> {
		const credentials = buildTmdbCredentials(env.TMDB_API_KEY);
		const url = `${externalLinks.tmdbApi}${path}?${new URLSearchParams({
			language: LANGUAGE,
			...parameters,
			...credentials.query,
		})}`;

		let attempt = 1;
		let response = await this.#send(url, credentials.headers, path);
		while (
			response.status === HTTP_TOO_MANY_REQUESTS &&
			attempt < MAX_ATTEMPTS
		) {
			// eslint-disable-next-line no-await-in-loop -- un essai ne repart qu'après l'attente demandée par TMDB
			await wait(
				getTmdbRetryDelayMs(response.headers.get("retry-after"), attempt),
			);
			attempt += 1;
			// eslint-disable-next-line no-await-in-loop -- idem
			response = await this.#send(url, credentials.headers, path);
		}

		if (response.status === HTTP_NOT_FOUND) return null;
		if (!response.ok)
			throw unavailable(`TMDB answered ${response.status} on ${path}`);
		try {
			return (await response.json()) as Result;
		} catch (error) {
			throw unavailable(`TMDB sent an unreadable body on ${path}`, error);
		}
	}

	async #send(
		url: string,
		headers: Record<string, string>,
		path: string,
	): Promise<Response> {
		await this.#pacer.waitForTurn();
		try {
			return await fetchWithTimeout(url, REQUEST_TIMEOUT_MS, { headers });
		} catch (error) {
			throw unavailable(`TMDB did not answer on ${path}`, error);
		}
	}
}

export const tmdbClient = new TmdbClient();

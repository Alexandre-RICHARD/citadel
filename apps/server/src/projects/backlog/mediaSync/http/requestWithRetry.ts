import { wait } from "@citadel/common/src/universal/async/wait.ts";
import { fetchWithTimeout } from "@citadel/common/src/universal/http/fetchWithTimeout.ts";

const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 4;

// Une clé d'API passée dans l'adresse n'apparaît jamais dans un message d'erreur
function redact(url: string): string {
	return url.replaceAll(/(api_key|apikey)=[^&]+/giu, "$1=…");
}

function isRetryable(status: number): boolean {
	return status === 429 || status >= 500;
}

/**
 * Un appel à un outil du NAS, réessayé sur une coupure, un 429 ou une erreur 5xx (un *arr tout juste démarré répond
 * parfois 503), avec une attente qui double. `name` : l'outil, pour le message d'erreur
 */
export async function requestWithRetry(
	name: string,
	url: string,
	init: RequestInit = {},
): Promise<Response> {
	let lastProblem = "";
	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
		if (attempt > 1)
			// eslint-disable-next-line no-await-in-loop -- les essais se suivent, chacun après une attente
			await wait(500 * 2 ** attempt);
		try {
			// eslint-disable-next-line no-await-in-loop -- idem
			const response = await fetchWithTimeout(url, TIMEOUT_MS, init);
			if (response.ok) return response;
			lastProblem = `HTTP ${response.status}`;
			if (!isRetryable(response.status)) break;
		} catch (error) {
			lastProblem = error instanceof Error ? error.message : String(error);
		}
	}
	throw new Error(`${name} : ${redact(url)} en échec (${lastProblem})`);
}

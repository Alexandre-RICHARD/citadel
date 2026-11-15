// Appels HTTP communs aux clients : délai maximal, nouvelles tentatives, et un nombre limité d'appels simultanés.
const timeoutMs = 30_000;
const maxAttempts = 4;

// Une clé d'API passée dans l'adresse ne doit jamais apparaître dans un message d'erreur
function redact(url) {
	return String(url).replace(/(api_key|apikey)=[^&]+/gi, "$1=…");
}

function isRetryable(status) {
	return status === 429 || status >= 500;
}

function retryDelayMs(response, attempt) {
	const retryAfter = Number(response?.headers.get("retry-after"));
	return Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function request(url, init = {}) {
	for (let attempt = 1; ; attempt++) {
		let response;
		try {
			response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
		} catch (error) {
			if (attempt >= maxAttempts) throw new Error(`${redact(url)} injoignable : ${error.cause?.code ?? error.message}`);
		}
		if (response?.ok) return response;
		if (response && (!isRetryable(response.status) || attempt >= maxAttempts)) {
			throw new Error(`${redact(url)} a répondu ${response.status} : ${(await response.text()).slice(0, 200)}`);
		}
		await wait(retryDelayMs(response, attempt));
	}
}

export async function requestJson(url, init) {
	return (await request(url, init)).json();
}

export async function mapWithConcurrency(items, limit, mapper) {
	const results = new Array(items.length);
	let next = 0;
	async function worker() {
		while (next < items.length) {
			const index = next++;
			results[index] = await mapper(items[index], index);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return results;
}

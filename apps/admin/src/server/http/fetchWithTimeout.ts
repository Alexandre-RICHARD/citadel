// Un service qui ne répond pas ne doit jamais bloquer la console : 4 s au plus
const TIMEOUT_MS = 4000;

export function fetchWithTimeout(
	url: string,
	init: RequestInit = {},
	timeoutMs = TIMEOUT_MS,
): Promise<Response> {
	return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}

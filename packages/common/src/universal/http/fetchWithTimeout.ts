// Un service qui ne répond pas ne bloque jamais l'appelant : au-delà de `timeoutMs`, fetch échoue (TimeoutError)
export function fetchWithTimeout(
	url: string,
	timeoutMs: number,
	init: RequestInit = {},
): Promise<Response> {
	return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}

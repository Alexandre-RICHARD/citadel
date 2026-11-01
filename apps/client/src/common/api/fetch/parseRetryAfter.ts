const SECOND_MS = 1000;
const DELAY_SECONDS_PATTERN = /^\d+$/;
// Une date HTTP finit toujours par GMT ; Date.parse accepterait sinon « -5 » (l'an -5)
const HTTP_DATE_SUFFIX = " GMT";

/**
 * En-tête Retry-After d'une 429, en secondes entières. Il donne soit un délai (« 120 »), soit une date HTTP
 * (« Wed, 21 Oct 2026 07:28:00 GMT ») ; absent ou illisible : null
 */
export function parseRetryAfter(
	header: string | null,
	now: number,
): number | null {
	if (header === null) return null;
	const value = header.trim();
	if (DELAY_SECONDS_PATTERN.test(value)) return Number(value);
	if (!value.endsWith(HTTP_DATE_SUFFIX)) return null;

	const retryAt = Date.parse(value);
	if (Number.isNaN(retryAt)) return null;
	return Math.max(0, Math.ceil((retryAt - now) / SECOND_MS));
}

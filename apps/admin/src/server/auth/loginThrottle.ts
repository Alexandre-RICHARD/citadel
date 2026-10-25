import { HttpError } from "../http/HttpError.ts";

// 5 mots de passe faux par adresse IP et par quart d'heure, puis refus jusqu'à la fin du
// quart d'heure : deviner le mot de passe à la chaîne devient impossible
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; since: number }>();

function currentFailures(
	ip: string,
	now: number,
): { count: number; since: number } {
	const entry = failures.get(ip);
	if (!entry || now - entry.since > WINDOW_MS) return { count: 0, since: now };
	return entry;
}

export const loginThrottle = {
	assertAllowed(ip: string): void {
		const now = Date.now();
		const entry = currentFailures(ip, now);
		if (entry.count < MAX_FAILURES) return;
		const minutes = Math.ceil((entry.since + WINDOW_MS - now) / 60000);
		throw new HttpError(429, `Trop d'essais : réessaie dans ${minutes} min`);
	},

	recordFailure(ip: string): void {
		const entry = currentFailures(ip, Date.now());
		failures.set(ip, { count: entry.count + 1, since: entry.since });
	},

	recordSuccess(ip: string): void {
		failures.delete(ip);
	},
};

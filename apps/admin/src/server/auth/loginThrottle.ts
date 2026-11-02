import { createSlidingWindowLimiter } from "@citadel/common/src/universal/limit/createSlidingWindowLimiter.ts";

import { HttpError } from "../http/HttpError.ts";

// 5 mots de passe faux par adresse IP sur le dernier quart d'heure, puis refus jusqu'à ce que
// le plus ancien ait un quart d'heure : deviner le mot de passe à la chaîne devient impossible
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MINUTE_MS = 60_000;
const failures = createSlidingWindowLimiter({
	limit: MAX_FAILURES,
	windowMs: WINDOW_MS,
});

export const loginThrottle = {
	assertAllowed(ip: string): void {
		const retryAfterMs = failures.getRetryAfterMs(ip);
		if (retryAfterMs === null) return;
		const minutes = Math.ceil(retryAfterMs / MINUTE_MS);
		throw new HttpError(429, `Trop d'essais : réessaie dans ${minutes} min`);
	},

	recordFailure(ip: string): void {
		failures.record(ip);
	},

	recordSuccess(ip: string): void {
		failures.forget(ip);
	},
};

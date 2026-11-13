import { createSlidingWindowLimiter } from "@citadel/common/src/universal/limit/createSlidingWindowLimiter.ts";

import { HttpError } from "../http/HttpError.ts";

// 5 essais par adresse IP sur le dernier quart d'heure, puis refus jusqu'à ce que le plus
// ancien ait un quart d'heure : deviner le mot de passe à la chaîne devient impossible.
// Un succès efface les essais de l'IP.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MINUTE_MS = 60_000;
const attempts = createSlidingWindowLimiter({
	limit: MAX_ATTEMPTS,
	windowMs: WINDOW_MS,
});

export const loginThrottle = {
	// Compté AVANT la vérification, qui prend du temps : 500 requêtes simultanées ne passent
	// pas toutes pendant que le compteur est encore à zéro
	claimAttempt(ip: string): void {
		const retryAfterMs = attempts.record(ip);
		if (retryAfterMs === null) return;
		const minutes = Math.ceil(retryAfterMs / MINUTE_MS);
		throw new HttpError(429, `Trop d'essais : réessayez dans ${minutes} min`);
	},

	recordSuccess(ip: string): void {
		attempts.forget(ip);
	},
};

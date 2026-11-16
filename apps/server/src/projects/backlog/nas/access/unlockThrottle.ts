import { createSlidingWindowLimiter } from "@citadel/common/src/universal/limit/createSlidingWindowLimiter.ts";

import { TooManyRequestsError } from "../../../../error/TooManyRequestsError.ts";

// 5 essais par adresse sur le dernier quart d'heure, comme la console. En mémoire : un arrêt pour inactivité (10 min sans
// visite) le remet à zéro, soit au pire 5 essais toutes les 10 minutes, et le compte du propriétaire reste exigé
const attempts = createSlidingWindowLimiter({
	limit: 5,
	windowMs: 15 * 60 * 1000,
});

export const unlockThrottle = {
	// Compté avant la vérification, qui prend du temps : une rafale ne passe pas pendant que le compteur est à zéro
	claimAttempt(ip: string): void {
		const retryAfterMs = attempts.record(ip);
		if (retryAfterMs !== null)
			throw new TooManyRequestsError(
				"Too many media password attempts",
				retryAfterMs,
			);
	},

	recordSuccess(ip: string): void {
		attempts.forget(ip);
	},
};

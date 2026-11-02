type Options = {
	// Événements acceptés par clé dans la fenêtre
	limit: number;
	windowMs: number;
	now?: () => number;
};

/**
 * Au plus `limit` événements par clé (une IP, un compte…) sur les `windowMs` dernières millisecondes. En mémoire : une
 * seule instance, remise à zéro à chaque redémarrage. Une clé sans événement récent disparaît, la mémoire ne grandit
 * pas avec les visiteurs passés
 */
export function createSlidingWindowLimiter({
	limit,
	windowMs,
	now = Date.now,
}: Options) {
	// Heures des événements de la fenêtre, par clé, de la plus ancienne à la plus récente
	const eventTimesByKey = new Map<string, number[]>();
	let lastSweepTime = -Infinity;

	// Les clés sans événement récent disparaissent, en un passage par fenêtre au plus : pas à chaque appel
	function sweepOldKeys(currentTime: number): void {
		if (currentTime - lastSweepTime < windowMs) return;
		lastSweepTime = currentTime;
		for (const [key, times] of eventTimesByKey)
			if (times.every((time) => time <= currentTime - windowMs))
				eventTimesByKey.delete(key);
	}

	// Seule la clé demandée est relue et élaguée
	function readRecentTimes(currentTime: number, key: string): number[] {
		sweepOldKeys(currentTime);
		const recentTimes = (eventTimesByKey.get(key) ?? []).filter(
			(time) => time > currentTime - windowMs,
		);
		if (recentTimes.length === 0) eventTimesByKey.delete(key);
		else eventTimesByKey.set(key, recentTimes);
		return recentTimes;
	}

	// La limite est atteinte quand la fenêtre est pleine : on attend que son plus vieil événement en sorte
	function computeRetryAfterMs(
		currentTime: number,
		recentTimes: number[],
	): number | null {
		const [oldestTime] = recentTimes;
		if (oldestTime === undefined || recentTimes.length < limit) return null;
		return oldestTime + windowMs - currentTime;
	}

	// Le délai avant qu'un événement de cette clé soit de nouveau accepté, en millisecondes ; null s'il l'est déjà
	function getRetryAfterMs(key: string): number | null {
		const currentTime = now();
		return computeRetryAfterMs(currentTime, readRecentTimes(currentTime, key));
	}

	// Compte l'événement et renvoie null ; au-delà de la limite, rien n'est compté et la réponse est le délai d'attente
	function record(key: string): number | null {
		const currentTime = now();
		const recentTimes = readRecentTimes(currentTime, key);
		const retryAfterMs = computeRetryAfterMs(currentTime, recentTimes);
		if (retryAfterMs !== null) return retryAfterMs;

		eventTimesByKey.set(key, [...recentTimes, currentTime]);
		return null;
	}

	function forget(key: string): void {
		eventTimesByKey.delete(key);
	}

	return { getRetryAfterMs, record, forget };
}

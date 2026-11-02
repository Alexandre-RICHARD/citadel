type Options = {
	now?: () => number;
};

/**
 * Des clés (une IP, un compte…) refusées jusqu'à une heure donnée. En mémoire : une seule instance, remise à zéro à
 * chaque redémarrage. Les bannissements finis disparaissent, la mémoire ne grandit pas avec les visiteurs passés
 */
export function createBanList({ now = Date.now }: Options = {}) {
	// Fin du bannissement, par clé
	const endTimeByKey = new Map<string, number>();
	let lastSweepTime = -Infinity;

	// Les bannissements finis disparaissent, en un passage par durée de bannissement au plus : pas à chaque appel
	function sweepEnded(currentTime: number, durationMs: number): void {
		if (currentTime - lastSweepTime < durationMs) return;
		lastSweepTime = currentTime;
		for (const [key, endTime] of endTimeByKey)
			if (endTime <= currentTime) endTimeByKey.delete(key);
	}

	// Refuse la clé pendant `durationMs` ; un bannissement plus long déjà en cours est gardé
	function ban(key: string, durationMs: number): void {
		const currentTime = now();
		sweepEnded(currentTime, durationMs);
		const endTime = currentTime + durationMs;
		endTimeByKey.set(key, Math.max(endTime, endTimeByKey.get(key) ?? 0));
	}

	// Le temps qu'il reste avant que la clé soit acceptée, en millisecondes ; null si elle l'est
	function getRemainingMs(key: string): number | null {
		const endTime = endTimeByKey.get(key);
		if (endTime === undefined) return null;
		const remainingMs = endTime - now();
		if (remainingMs > 0) return remainingMs;
		endTimeByKey.delete(key);
		return null;
	}

	function forget(key: string): void {
		endTimeByKey.delete(key);
	}

	return { ban, getRemainingMs, forget };
}

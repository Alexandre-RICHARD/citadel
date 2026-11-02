type Options = {
	// Sans nouvel échec pendant cette durée, le compteur repart de zéro
	resetMs: number;
	now?: () => number;
};

type Failures = {
	count: number;
	lastTime: number;
};

/**
 * Compte les échecs successifs par clé (un compte depuis une IP…), remis à zéro par un succès ou par `resetMs` de calme.
 * En mémoire : une seule instance, remise à zéro à chaque redémarrage. Les compteurs calmés disparaissent
 */
export function createFailureCounter({ resetMs, now = Date.now }: Options) {
	const failuresByKey = new Map<string, Failures>();
	let lastSweepTime = -Infinity;

	function isCalm(failures: Failures, currentTime: number): boolean {
		return currentTime - failures.lastTime >= resetMs;
	}

	// Les compteurs calmés disparaissent, en un passage par `resetMs` au plus : pas à chaque appel
	function sweepCalm(currentTime: number): void {
		if (currentTime - lastSweepTime < resetMs) return;
		lastSweepTime = currentTime;
		for (const [key, failures] of failuresByKey)
			if (isCalm(failures, currentTime)) failuresByKey.delete(key);
	}

	// Compte un échec ; renvoie le nombre d'échecs successifs, celui-ci compris
	function record(key: string): number {
		const currentTime = now();
		sweepCalm(currentTime);
		const previous = failuresByKey.get(key);
		const count =
			previous === undefined || isCalm(previous, currentTime)
				? 1
				: previous.count + 1;
		failuresByKey.set(key, { count, lastTime: currentTime });
		return count;
	}

	function reset(key: string): void {
		failuresByKey.delete(key);
	}

	return { record, reset };
}

import { wait } from "../async/wait.ts";

/**
 * Espace les départs d'appels vers un service qui limite le débit : au moins `gapMs` entre deux départs. Chaque appel
 * réserve le créneau suivant avant toute attente : des appels simultanés partent à la suite, dans l'ordre d'arrivée
 */
export function createRequestPacer(gapMs: number) {
	let nextStartAt = 0;

	async function waitForTurn(): Promise<void> {
		const now = Date.now();
		const startAt = Math.max(now, nextStartAt);
		nextStartAt = startAt + gapMs;
		if (startAt > now) await wait(startAt - now);
	}

	return { waitForTurn };
}

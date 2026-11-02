import { QueueFullError } from "./QueueFullError.ts";

type Options = {
	// Tâches lancées en même temps, au plus
	concurrency: number;
	// Tâches en attente d'une place, au plus ; au-delà, QueueFullError
	queueMax: number;
};

/**
 * Plafonne les tâches lourdes simultanées (un hash de mot de passe prend 19 Mio) : au plus `concurrency` à la fois, les
 * suivantes attendent leur tour dans l'ordre d'arrivée, et au-delà de `queueMax` en attente, refus immédiat
 */
export function createConcurrencyLimiter({ concurrency, queueMax }: Options) {
	let runningCount = 0;
	const waitingStarts: (() => void)[] = [];

	function startNext(): void {
		runningCount -= 1;
		const start = waitingStarts.shift();
		if (start === undefined) return;
		runningCount += 1;
		start();
	}

	async function waitForSlot(): Promise<void> {
		if (runningCount < concurrency) {
			runningCount += 1;
			return;
		}
		if (waitingStarts.length >= queueMax) throw new QueueFullError();
		await new Promise<void>((resolve) => {
			waitingStarts.push(resolve);
		});
	}

	async function run<Result>(task: () => Promise<Result>): Promise<Result> {
		await waitForSlot();
		try {
			return await task();
		} finally {
			startNext();
		}
	}

	return { run };
}

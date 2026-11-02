import { describe, expect, it } from "vitest";

import { createConcurrencyLimiter } from "./createConcurrencyLimiter.ts";
import { QueueFullError } from "./QueueFullError.ts";

// Une tâche qui ne finit que sur ordre du test
function createControlledTask() {
	let finish: (() => void) | null = null;
	let isStarted = false;
	async function task(): Promise<string> {
		isStarted = true;
		await new Promise<void>((resolve) => {
			finish = resolve;
		});
		return "done";
	}
	return {
		task,
		finish: () => {
			finish?.();
		},
		isStarted: () => isStarted,
	};
}

// Laisse les promesses déjà résolues s'enchaîner
async function settle(): Promise<void> {
	await new Promise((resolve) => {
		setTimeout(resolve, 0);
	});
}

describe("createConcurrencyLimiter.ts", () => {
	describe("running tasks", () => {
		it("SHOULD start the tasks at once WHEN under the concurrency", async () => {
			// Arrange
			const limiter = createConcurrencyLimiter({ concurrency: 2, queueMax: 0 });
			const first = createControlledTask();
			const second = createControlledTask();

			// Act
			const results = [limiter.run(first.task), limiter.run(second.task)];
			await settle();

			// Assert
			expect(first.isStarted()).toBe(true);
			expect(second.isStarted()).toBe(true);
			first.finish();
			second.finish();
			await expect(Promise.all(results)).resolves.toStrictEqual([
				"done",
				"done",
			]);
		});

		it("SHOULD start a waiting task only once a running one ends WHEN over the concurrency", async () => {
			// Arrange
			const limiter = createConcurrencyLimiter({ concurrency: 1, queueMax: 1 });
			const first = createControlledTask();
			const second = createControlledTask();
			const firstResult = limiter.run(first.task);
			const secondResult = limiter.run(second.task);
			await settle();
			expect(second.isStarted()).toBe(false);

			// Act
			first.finish();
			await firstResult;
			await settle();

			// Assert
			expect(second.isStarted()).toBe(true);
			second.finish();
			await expect(secondResult).resolves.toBe("done");
		});

		it("SHOULD free the slot WHEN a task fails", async () => {
			// Arrange
			const limiter = createConcurrencyLimiter({ concurrency: 1, queueMax: 0 });
			await expect(
				limiter.run(async () => Promise.reject(new Error("hash failed"))),
			).rejects.toThrow("hash failed");

			// Act
			const result = limiter.run(async () => Promise.resolve("next"));

			// Assert
			await expect(result).resolves.toBe("next");
		});
	});

	describe("full queue", () => {
		it("SHOULD refuse the task without starting it WHEN the queue is full", async () => {
			// Arrange
			const limiter = createConcurrencyLimiter({ concurrency: 1, queueMax: 1 });
			const running = createControlledTask();
			const waiting = createControlledTask();
			const refused = createControlledTask();
			const runningResult = limiter.run(running.task);
			const waitingResult = limiter.run(waiting.task);

			// Act
			const refusedResult = limiter.run(refused.task);

			// Assert
			await expect(refusedResult).rejects.toBeInstanceOf(QueueFullError);
			expect(refused.isStarted()).toBe(false);
			running.finish();
			await runningResult;
			await settle();
			waiting.finish();
			await waitingResult;
		});
	});
});

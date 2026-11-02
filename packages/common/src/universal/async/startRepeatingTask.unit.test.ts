import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { startRepeatingTask } from "./startRepeatingTask.ts";

const INTERVAL_MS = 1000;

// Une tâche qui dure `durationMs` (en temps simulé)
function createSlowTask(durationMs: number) {
	return vi.fn(
		async () =>
			new Promise<void>((resolve) => {
				setTimeout(resolve, durationMs);
			}),
	);
}

describe("startRepeatingTask.ts", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("schedule", () => {
		it("SHOULD run at once, then at every interval WHEN started", async () => {
			// Arrange
			const task = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

			// Act
			const stop = startRepeatingTask({
				intervalMs: INTERVAL_MS,
				task,
				onError: vi.fn(),
			});
			await vi.advanceTimersByTimeAsync(2 * INTERVAL_MS);
			await stop();

			// Assert
			expect(task).toHaveBeenCalledTimes(3);
		});

		it("SHOULD run no more WHEN stopped", async () => {
			// Arrange
			const task = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
			const stop = startRepeatingTask({
				intervalMs: INTERVAL_MS,
				task,
				onError: vi.fn(),
			});

			// Act
			await stop();
			await vi.advanceTimersByTimeAsync(3 * INTERVAL_MS);

			// Assert
			expect(task).toHaveBeenCalledTimes(1);
		});

		it("SHOULD skip a run WHEN the previous one is still running", async () => {
			// Arrange : le premier passage dure deux intervalles et demi
			const task = createSlowTask(2.5 * INTERVAL_MS);

			// Act
			const stop = startRepeatingTask({
				intervalMs: INTERVAL_MS,
				task,
				onError: vi.fn(),
			});
			await vi.advanceTimersByTimeAsync(3 * INTERVAL_MS);
			const stopped = stop();
			await vi.advanceTimersByTimeAsync(2.5 * INTERVAL_MS);
			await stopped;

			// Assert
			expect(task).toHaveBeenCalledTimes(2);
		});
	});

	describe("stop", () => {
		it("SHOULD resolve only after the running pass WHEN stopped during it", async () => {
			// Arrange
			const stop = startRepeatingTask({
				intervalMs: INTERVAL_MS,
				task: createSlowTask(500),
				onError: vi.fn(),
			});
			let isStopped = false;

			// Act
			const stopped = stop().then(() => {
				isStopped = true;
			});
			await vi.advanceTimersByTimeAsync(499);
			const isStoppedDuringRun = isStopped;
			await vi.advanceTimersByTimeAsync(1);
			await stopped;

			// Assert
			expect(isStoppedDuringRun).toBe(false);
			expect(isStopped).toBe(true);
		});
	});

	describe("errors", () => {
		it("SHOULD report the error and keep repeating WHEN a run fails", async () => {
			// Arrange
			const failure = new Error("Database down");
			const task = vi
				.fn<() => Promise<void>>()
				.mockRejectedValueOnce(failure)
				.mockResolvedValue(undefined);
			const onError = vi.fn();

			// Act
			const stop = startRepeatingTask({
				intervalMs: INTERVAL_MS,
				task,
				onError,
			});
			await vi.advanceTimersByTimeAsync(INTERVAL_MS);
			await stop();

			// Assert
			expect(onError).toHaveBeenCalledExactlyOnceWith(failure);
			expect(task).toHaveBeenCalledTimes(2);
		});

		it("SHOULD keep repeating WHEN reporting the error fails too", async () => {
			// Arrange
			const task = vi
				.fn<() => Promise<void>>()
				.mockRejectedValue(new Error("Database down"));
			const onError = vi
				.fn<() => Promise<void>>()
				.mockRejectedValue(new Error("Logger down"));

			// Act
			const stop = startRepeatingTask({
				intervalMs: INTERVAL_MS,
				task,
				onError,
			});
			await vi.advanceTimersByTimeAsync(INTERVAL_MS);

			// Assert : aucune promesse rejetée ne s'échappe (Vitest ferait échouer le test)
			await expect(stop()).resolves.toBeUndefined();
			expect(task).toHaveBeenCalledTimes(2);
		});
	});
});

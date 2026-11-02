import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { startRepeatingTask } from "./startRepeatingTask.ts";

const INTERVAL_MS = 1000;

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
			stop();

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
			stop();
			await vi.advanceTimersByTimeAsync(3 * INTERVAL_MS);

			// Assert
			expect(task).toHaveBeenCalledTimes(1);
		});

		it("SHOULD skip a run WHEN the previous one is still running", async () => {
			// Arrange : le premier passage dure deux intervalles et demi
			const task = vi.fn(
				async () =>
					new Promise<void>((resolve) => {
						setTimeout(resolve, 2.5 * INTERVAL_MS);
					}),
			);

			// Act
			const stop = startRepeatingTask({
				intervalMs: INTERVAL_MS,
				task,
				onError: vi.fn(),
			});
			await vi.advanceTimersByTimeAsync(3 * INTERVAL_MS);
			stop();

			// Assert
			expect(task).toHaveBeenCalledTimes(2);
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
			stop();

			// Assert
			expect(onError).toHaveBeenCalledExactlyOnceWith(failure);
			expect(task).toHaveBeenCalledTimes(2);
		});
	});
});

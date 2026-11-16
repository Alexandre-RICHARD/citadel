import { describe, expect, it } from "vitest";

import { mapWithConcurrency } from "./mapWithConcurrency.ts";

describe("mapWithConcurrency.ts", () => {
	describe("results", () => {
		it("SHOULD give the results in the order of the items, whatever the order they finish in", async () => {
			const delays = [30, 0, 10];

			const results = await mapWithConcurrency(delays, 2, async (delay) => {
				await new Promise((resolve) => {
					setTimeout(resolve, delay);
				});
				return delay * 2;
			});

			expect(results).toStrictEqual([60, 0, 20]);
		});

		it("SHOULD give an empty list WHEN there is no item", async () => {
			expect(
				await mapWithConcurrency([], 3, () => Promise.resolve(1)),
			).toStrictEqual([]);
		});
	});

	describe("concurrency", () => {
		it("SHOULD never run more calls at once than the limit", async () => {
			let running = 0;
			let maxRunning = 0;

			await mapWithConcurrency([1, 2, 3, 4, 5], 2, async () => {
				running += 1;
				maxRunning = Math.max(maxRunning, running);
				await new Promise((resolve) => {
					setTimeout(resolve, 5);
				});
				running -= 1;
			});

			expect(maxRunning).toBe(2);
		});
	});

	describe("errors", () => {
		it("SHOULD reject WHEN a call fails", async () => {
			await expect(
				mapWithConcurrency([1, 2], 2, (item) =>
					item === 2
						? Promise.reject(new Error("TMDB is down"))
						: Promise.resolve(item),
				),
			).rejects.toThrow("TMDB is down");
		});
	});
});

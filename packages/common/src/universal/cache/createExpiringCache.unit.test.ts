import { describe, expect, it } from "vitest";

import { createExpiringCache } from "./createExpiringCache.ts";

const DURATION_MS = 1000;

function createCache(maxEntries = 10) {
	let now = Date.parse("2026-11-16T10:00:00Z");
	const cache = createExpiringCache<number, string>({
		durationMs: DURATION_MS,
		maxEntries,
		now: () => now,
	});
	return {
		cache,
		advance: (ms: number) => {
			now += ms;
		},
	};
}

describe("createExpiringCache.ts", () => {
	describe("get", () => {
		it("SHOULD give the value under each of its keys WHEN it has not expired", () => {
			const { cache, advance } = createCache();
			cache.set([1, 2], "Dune");
			advance(DURATION_MS - 1);

			expect([cache.get(1), cache.get(2)]).toStrictEqual(["Dune", "Dune"]);
		});

		it("SHOULD give nothing WHEN the value has expired", () => {
			const { cache, advance } = createCache();
			cache.set([1], "Dune");
			advance(DURATION_MS);

			expect(cache.get(1)).toBeUndefined();
		});

		it("SHOULD give nothing WHEN the key was never set", () => {
			const { cache } = createCache();

			expect(cache.get(1)).toBeUndefined();
		});
	});

	describe("set", () => {
		it("SHOULD forget the oldest keys first WHEN there are more than the maximum", () => {
			const { cache } = createCache(2);
			cache.set([1], "Dune");
			cache.set([2], "Alien");
			cache.set([3], "Heat");

			expect([cache.get(1), cache.get(2), cache.get(3)]).toStrictEqual([
				undefined,
				"Alien",
				"Heat",
			]);
		});

		it("SHOULD keep a refreshed key WHEN older keys are forgotten", () => {
			const { cache } = createCache(2);
			cache.set([1], "Dune");
			cache.set([2], "Alien");
			cache.set([1], "Dune");
			cache.set([3], "Heat");

			expect([cache.get(1), cache.get(2), cache.get(3)]).toStrictEqual([
				"Dune",
				undefined,
				"Heat",
			]);
		});
	});

	describe("clear", () => {
		it("SHOULD forget every value", () => {
			const { cache } = createCache();
			cache.set([1, 2], "Dune");

			cache.clear();

			expect([cache.get(1), cache.get(2)]).toStrictEqual([
				undefined,
				undefined,
			]);
		});
	});
});

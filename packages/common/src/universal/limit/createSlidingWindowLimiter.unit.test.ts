import { describe, expect, it } from "vitest";

import { createSlidingWindowLimiter } from "./createSlidingWindowLimiter.ts";

const LIMIT = 2;
const MINUTE_MS = 60_000;
const WINDOW_MS = 60 * MINUTE_MS;
const KEY = "203.0.113.1";

function createLimiter() {
	let now = Date.parse("2026-11-01T11:00:00Z");
	const limiter = createSlidingWindowLimiter({
		limit: LIMIT,
		windowMs: WINDOW_MS,
		now: () => now,
	});
	return {
		limiter,
		advance: (ms: number) => {
			now += ms;
		},
	};
}

describe("createSlidingWindowLimiter.ts", () => {
	describe("record", () => {
		it("SHOULD accept the events WHEN the key stays under the limit", () => {
			const { limiter } = createLimiter();

			expect(limiter.record(KEY)).toBeNull();
			expect(limiter.record(KEY)).toBeNull();
		});

		it("SHOULD give the wait until the oldest event leaves the window WHEN the key reaches the limit", () => {
			const { limiter, advance } = createLimiter();
			limiter.record(KEY);
			advance(10 * MINUTE_MS);
			limiter.record(KEY);

			expect(limiter.record(KEY)).toBe(50 * MINUTE_MS);
		});

		it("SHOULD accept again WHEN the oldest event has left the window", () => {
			const { limiter, advance } = createLimiter();
			limiter.record(KEY);
			limiter.record(KEY);

			advance(WINDOW_MS);

			expect(limiter.record(KEY)).toBeNull();
		});

		it("SHOULD not count a refused event WHEN the key is over the limit", () => {
			const { limiter, advance } = createLimiter();
			limiter.record(KEY);
			advance(30 * MINUTE_MS);
			limiter.record(KEY);
			limiter.record(KEY);

			advance(30 * MINUTE_MS);

			expect(limiter.record(KEY)).toBeNull();
		});

		it("SHOULD count each key apart WHEN another key reached its limit", () => {
			const { limiter } = createLimiter();
			limiter.record(KEY);
			limiter.record(KEY);

			expect(limiter.record("203.0.113.2")).toBeNull();
		});
	});

	describe("getRetryAfterMs", () => {
		it("SHOULD answer null without counting anything WHEN the key is under the limit", () => {
			const { limiter } = createLimiter();
			limiter.record(KEY);

			expect(limiter.getRetryAfterMs(KEY)).toBeNull();
			expect(limiter.getRetryAfterMs(KEY)).toBeNull();
			expect(limiter.record(KEY)).toBeNull();
		});

		it("SHOULD give the wait WHEN the key reached the limit", () => {
			const { limiter, advance } = createLimiter();
			limiter.record(KEY);
			limiter.record(KEY);

			advance(15 * MINUTE_MS);

			expect(limiter.getRetryAfterMs(KEY)).toBe(45 * MINUTE_MS);
		});
	});

	describe("forget", () => {
		it("SHOULD accept the key again WHEN its events are forgotten", () => {
			const { limiter } = createLimiter();
			limiter.record(KEY);
			limiter.record(KEY);

			limiter.forget(KEY);

			expect(limiter.record(KEY)).toBeNull();
		});
	});
});

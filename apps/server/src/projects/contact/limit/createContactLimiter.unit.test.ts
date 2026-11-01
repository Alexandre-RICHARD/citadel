import { describe, expect, it } from "vitest";

import { createContactLimiter } from "./createContactLimiter.ts";

const HOURLY_LIMIT = 2;
const MINUTE_MS = 60_000;
const NOON = Date.parse("2026-11-01T11:00:00Z");

function createLimiter() {
	let now = NOON;
	const limiter = createContactLimiter(HOURLY_LIMIT, () => now);
	return {
		limiter,
		advance: (ms: number) => {
			now += ms;
		},
	};
}

describe("createContactLimiter.ts", () => {
	describe("messages per IP", () => {
		it("SHOULD accept the messages WHEN the IP stays under the hourly limit", () => {
			const { limiter } = createLimiter();

			expect(limiter.recordMessage("203.0.113.1")).toBeNull();
			expect(limiter.recordMessage("203.0.113.1")).toBeNull();
		});

		it("SHOULD give the wait until the oldest message is an hour old WHEN the IP reaches the limit", () => {
			const { limiter, advance } = createLimiter();
			limiter.recordMessage("203.0.113.1");
			advance(10 * MINUTE_MS);
			limiter.recordMessage("203.0.113.1");

			expect(limiter.recordMessage("203.0.113.1")).toBe(50 * MINUTE_MS);
		});

		it("SHOULD accept again WHEN the oldest message is an hour old", () => {
			const { limiter, advance } = createLimiter();
			limiter.recordMessage("203.0.113.1");
			limiter.recordMessage("203.0.113.1");

			advance(60 * MINUTE_MS);

			expect(limiter.recordMessage("203.0.113.1")).toBeNull();
		});

		it("SHOULD not count a refused message WHEN the IP is over the limit", () => {
			const { limiter, advance } = createLimiter();
			limiter.recordMessage("203.0.113.1");
			advance(30 * MINUTE_MS);
			limiter.recordMessage("203.0.113.1");
			limiter.recordMessage("203.0.113.1");

			advance(30 * MINUTE_MS);

			expect(limiter.recordMessage("203.0.113.1")).toBeNull();
		});

		it("SHOULD count each IP apart WHEN another IP reached its limit", () => {
			const { limiter } = createLimiter();
			limiter.recordMessage("203.0.113.1");
			limiter.recordMessage("203.0.113.1");

			expect(limiter.recordMessage("203.0.113.2")).toBeNull();
		});
	});

	describe("acknowledgements", () => {
		it("SHOULD allow one acknowledgement per address WHEN the same day", () => {
			const { limiter } = createLimiter();

			expect(limiter.claimAcknowledgement("sam@example.com")).toBe(true);
			expect(limiter.claimAcknowledgement("Sam@Example.com")).toBe(false);
		});

		it("SHOULD allow a new acknowledgement WHEN the day changes in Paris", () => {
			const { limiter, advance } = createLimiter();
			limiter.claimAcknowledgement("sam@example.com");

			// 23 h 30 UTC : 0 h 30 à Paris, le lendemain
			advance(12.5 * 60 * MINUTE_MS);

			expect(limiter.claimAcknowledgement("sam@example.com")).toBe(true);
		});
	});
});

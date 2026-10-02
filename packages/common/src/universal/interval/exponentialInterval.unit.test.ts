import { describe, expect, it } from "vitest";

import { exponentialInterval } from "./exponentialInterval.ts";

describe("exponentialInterval.ts", () => {
	describe("growth", () => {
		it("SHOULD return the base delay in milliseconds WHEN it is the first retry", () => {
			expect(exponentialInterval(2, 0)).toBe(2_000);
		});

		it("SHOULD multiply the delay by the factor at each retry", () => {
			expect(
				[0, 1, 2, 3].map((attempt) => exponentialInterval(2, attempt)),
			).toStrictEqual([2_000, 4_000, 8_000, 16_000]);
		});

		it("SHOULD use the given factor", () => {
			expect(exponentialInterval(1, 2, 3)).toBe(9_000);
		});

		it("SHOULD keep the delay constant WHEN the factor is 1", () => {
			expect(exponentialInterval(5, 10, 1)).toBe(5_000);
		});
	});

	describe("maximum delay", () => {
		it("SHOULD cap the delay WHEN it exceeds the maximum", () => {
			expect(exponentialInterval(2, 10, 2, 60)).toBe(60_000);
		});

		it("SHOULD not change the delay WHEN it is below the maximum", () => {
			expect(exponentialInterval(2, 1, 2, 60)).toBe(4_000);
		});

		it("SHOULD apply the maximum from the first retry", () => {
			expect(exponentialInterval(10, 0, 2, 5)).toBe(5_000);
		});

		it("SHOULD return no delay WHEN the maximum is 0", () => {
			expect(exponentialInterval(2, 3, 2, 0)).toBe(0);
		});
	});
});

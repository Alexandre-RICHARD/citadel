import { describe, expect, it } from "vitest";

import { getCouponLevelsCost } from "./getCouponLevelsCost";

describe("getCouponLevelsCost.ts", () => {
	describe("range", () => {
		it("SHOULD add up the cost of every coupon, both ends included", () => {
			expect(getCouponLevelsCost(2, 4)).toBe(500 + 500 + 1250);
		});

		it("SHOULD cost a single coupon WHEN both ends are the same", () => {
			expect(getCouponLevelsCost(7, 7)).toBe(2000);
		});

		it("SHOULD cost nothing WHEN the range is empty", () => {
			expect(getCouponLevelsCost(5, 4)).toBe(0);
		});
	});
});

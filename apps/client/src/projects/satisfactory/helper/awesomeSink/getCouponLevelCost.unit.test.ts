import { describe, expect, it } from "vitest";

import { getCouponLevelCost } from "./getCouponLevelCost";

describe("getCouponLevelCost.ts", () => {
	describe("first tier", () => {
		it.each([1, 2, 3])(
			"SHOULD cost 500 points WHEN the coupon is the number %i",
			(level) => {
				expect(getCouponLevelCost(level)).toBe(500);
			},
		);
	});

	describe("next tiers", () => {
		it.each([
			{ level: 4, expected: 1250 },
			{ level: 6, expected: 1250 },
			{ level: 7, expected: 2000 },
			{ level: 10, expected: 3250 },
		])(
			"SHOULD cost $expected points WHEN the coupon is the number $level",
			({ level, expected }) => {
				expect(getCouponLevelCost(level)).toBe(expected);
			},
		);

		it("SHOULD stop rising WHEN the tier reaches 999", () => {
			expect(getCouponLevelCost(10_000)).toBe(getCouponLevelCost(3000));
		});
	});
});

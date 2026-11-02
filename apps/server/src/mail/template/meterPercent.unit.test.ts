import { describe, expect, it } from "vitest";

import { meterPercent } from "./meterPercent.ts";

describe("meterPercent.ts", () => {
	describe("percentage", () => {
		it("SHOULD round down to a whole percentage, so that only a full gauge shows 100 %", () => {
			expect(meterPercent(250, 300)).toBe(83);
			expect(meterPercent(299, 300)).toBe(99);
		});

		it("SHOULD stay between 0 and 100 WHEN the value is out of bounds", () => {
			expect(meterPercent(320, 300)).toBe(100);
			expect(meterPercent(-5, 300)).toBe(0);
		});

		it("SHOULD be full WHEN the maximum is zero", () => {
			expect(meterPercent(0, 0)).toBe(100);
		});
	});
});

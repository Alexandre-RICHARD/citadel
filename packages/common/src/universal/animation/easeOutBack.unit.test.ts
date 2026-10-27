import { describe, expect, it } from "vitest";

import { easeOutBack } from "./easeOutBack.ts";

describe("easeOutBack.ts", () => {
	describe("curve", () => {
		it("SHOULD start at 0 and end at 1", () => {
			expect(easeOutBack(0)).toBeCloseTo(0);
			expect(easeOutBack(1)).toBe(1);
		});

		it("SHOULD overshoot the target WHEN the animation is nearly done", () => {
			expect(easeOutBack(0.8)).toBeGreaterThan(1);
		});
	});
});

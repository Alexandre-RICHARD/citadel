import { describe, expect, it } from "vitest";

import { easeInOutCubic } from "./easeInOutCubic.ts";

describe("easeInOutCubic.ts", () => {
	describe("curve", () => {
		it("SHOULD start at 0 and end at 1", () => {
			expect(easeInOutCubic(0)).toBe(0);
			expect(easeInOutCubic(1)).toBe(1);
		});

		it("SHOULD pass through the middle WHEN progress is one half", () => {
			expect(easeInOutCubic(0.5)).toBe(0.5);
		});

		it("SHOULD lag behind progress WHEN the animation starts", () => {
			expect(easeInOutCubic(0.2)).toBeLessThan(0.2);
		});
	});
});

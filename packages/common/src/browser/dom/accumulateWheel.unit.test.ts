import { describe, expect, it } from "vitest";

import { accumulateWheel } from "./accumulateWheel.ts";

const PIXELS = 0;
const LINES = 1;
const PAGES = 2;

describe("accumulateWheel.ts", () => {
	describe("mouse wheel notch", () => {
		it("SHOULD give one step down WHEN a notch of 100 pixels scrolls down", () => {
			expect(accumulateWheel(0, 100, PIXELS)).toStrictEqual({
				step: 1,
				accumulated: 0,
			});
		});

		it("SHOULD give one step up WHEN a notch of 100 pixels scrolls up", () => {
			expect(accumulateWheel(0, -100, PIXELS)).toStrictEqual({
				step: -1,
				accumulated: 0,
			});
		});

		it("SHOULD give one step WHEN a notch is counted in 3 lines", () => {
			expect(accumulateWheel(0, 3, LINES).step).toBe(1);
		});

		it("SHOULD give one step WHEN a notch is counted in pages", () => {
			expect(accumulateWheel(0, -1, PAGES).step).toBe(-1);
		});
	});

	describe("touchpad", () => {
		it("SHOULD give no step and keep the scroll WHEN it is below the threshold", () => {
			expect(accumulateWheel(0, 20, PIXELS)).toStrictEqual({
				step: 0,
				accumulated: 20,
			});
		});

		it("SHOULD give a step WHEN small scrolls add up to the threshold", () => {
			expect(accumulateWheel(40, 20, PIXELS)).toStrictEqual({
				step: 1,
				accumulated: 0,
			});
		});

		it("SHOULD cancel the scroll kept WHEN the wheel turns the other way", () => {
			expect(accumulateWheel(40, -30, PIXELS)).toStrictEqual({
				step: 0,
				accumulated: 10,
			});
		});
	});
});

import { describe, expect, it } from "vitest";

import { shiftDuration } from "./shiftDuration.ts";

describe("shiftDuration.ts", () => {
	describe("minutes", () => {
		it("SHOULD add a minute", () => {
			expect(shiftDuration(90, "minutes", 1)).toBe(91);
		});

		it("SHOULD carry over to the next hour WHEN the minutes go past 59", () => {
			expect(shiftDuration(179, "minutes", 1)).toBe(180);
		});

		it("SHOULD borrow an hour WHEN the minutes go below 0", () => {
			expect(shiftDuration(180, "minutes", -1)).toBe(179);
		});

		it("SHOULD stay at zero WHEN the duration is already zero", () => {
			expect(shiftDuration(0, "minutes", -1)).toBe(0);
		});
	});

	describe("hours", () => {
		it("SHOULD add an hour and keep the minutes", () => {
			expect(shiftDuration(150, "hours", 1)).toBe(210);
		});

		it("SHOULD remove an hour and keep the minutes", () => {
			expect(shiftDuration(210, "hours", -1)).toBe(150);
		});

		it("SHOULD stay at zero WHEN there is less than an hour to remove", () => {
			expect(shiftDuration(30, "hours", -1)).toBe(0);
		});
	});
});

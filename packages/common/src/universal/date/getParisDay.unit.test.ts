import { describe, expect, it } from "vitest";

import { getParisDay } from "./getParisDay.ts";

describe("getParisDay.ts", () => {
	describe("day in Paris", () => {
		it("SHOULD give the same day WHEN UTC and Paris agree", () => {
			expect(getParisDay(Date.parse("2026-11-01T12:00:00Z"))).toBe(
				"2026-11-01",
			);
		});

		it("SHOULD give the next day WHEN it is already past midnight in Paris (winter, UTC+1)", () => {
			expect(getParisDay(Date.parse("2026-11-01T23:30:00Z"))).toBe(
				"2026-11-02",
			);
		});

		it("SHOULD give the next day WHEN it is already past midnight in Paris (summer, UTC+2)", () => {
			expect(getParisDay(Date.parse("2026-07-14T22:30:00Z"))).toBe(
				"2026-07-15",
			);
		});
	});
});

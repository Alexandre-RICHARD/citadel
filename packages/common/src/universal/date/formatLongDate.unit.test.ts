import { describe, expect, it } from "vitest";

import { formatLongDate } from "./formatLongDate.ts";

describe("formatLongDate.ts", () => {
	describe("valid date", () => {
		it("SHOULD write the month in full WHEN given a date", () => {
			expect(formatLongDate(new Date(2011, 8, 2, 23, 59))).toBe(
				"02 septembre 2011",
			);
		});

		it("SHOULD accept an ISO string", () => {
			expect(formatLongDate(new Date(2018, 0, 25).toISOString())).toBe(
				"25 janvier 2018",
			);
		});
	});

	describe("missing or invalid date", () => {
		it.each([null, undefined, ""])(
			"SHOULD return null WHEN the date is %j",
			(value) => {
				expect(formatLongDate(value)).toBeNull();
			},
		);

		it("SHOULD return null WHEN the date is invalid", () => {
			expect(formatLongDate("2011-13-45")).toBeNull();
		});
	});
});

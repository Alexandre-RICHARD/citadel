import { describe, expect, it } from "vitest";

import { toDateInputValue } from "./toDateInputValue.ts";

describe("toDateInputValue.ts", () => {
	describe("valid date", () => {
		it("SHOULD return the local day as YYYY-MM-DD with padded month and day", () => {
			expect(toDateInputValue(new Date(2019, 2, 5, 23, 59))).toBe("2019-03-05");
		});

		it("SHOULD accept an ISO string", () => {
			expect(toDateInputValue(new Date(2011, 11, 31, 12).toISOString())).toBe(
				"2011-12-31",
			);
		});

		it("SHOULD pad the year to 4 digits WHEN it is before 1000", () => {
			const date = new Date(2000, 0, 1);
			date.setFullYear(987);

			expect(toDateInputValue(date)).toBe("0987-01-01");
		});
	});

	describe("invalid date", () => {
		it("SHOULD return an empty string, which empties the input, WHEN the date is invalid", () => {
			expect(toDateInputValue("not a date")).toBe("");
		});
	});
});

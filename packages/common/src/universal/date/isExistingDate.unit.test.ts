import { describe, expect, it } from "vitest";

import { isExistingDate } from "./isExistingDate.ts";

describe("isExistingDate.ts", () => {
	describe("existing days", () => {
		it.each([
			{ year: 2013, month: 9, day: 17 },
			{ year: 2024, month: 2, day: 29 },
			{ year: 2023, month: 12, day: 31 },
		])(
			"SHOULD return true WHEN the date is $day/$month/$year",
			({ year, month, day }) => {
				expect(isExistingDate(year, month, day)).toBe(true);
			},
		);
	});

	describe("impossible days", () => {
		it.each([
			{
				reason: "the 29th of February is outside a leap year",
				year: 2023,
				month: 2,
				day: 29,
			},
			{
				reason: "the day is past the end of the month",
				year: 2023,
				month: 4,
				day: 31,
			},
			{ reason: "the day is zero", year: 2023, month: 4, day: 0 },
			{ reason: "the month is zero", year: 2023, month: 0, day: 1 },
			{ reason: "the month is 13", year: 2023, month: 13, day: 1 },
			{ reason: "a part is not an integer", year: 2023, month: 1.5, day: 1 },
		])("SHOULD return false WHEN $reason", ({ year, month, day }) => {
			expect(isExistingDate(year, month, day)).toBe(false);
		});
	});
});

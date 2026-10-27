import { describe, expect, it } from "vitest";

import { getDaysInMonth } from "./getDaysInMonth.ts";

describe("getDaysInMonth.ts", () => {
	describe("months", () => {
		it.each([
			{ year: 2023, month: 1, expected: 31 },
			{ year: 2023, month: 4, expected: 30 },
			{ year: 2023, month: 2, expected: 28 },
			{ year: 2024, month: 2, expected: 29 },
			{ year: 1900, month: 2, expected: 28 },
			{ year: 2000, month: 2, expected: 29 },
		])(
			"SHOULD return $expected WHEN the month is $month/$year",
			({ year, month, expected }) => {
				expect(getDaysInMonth(year, month)).toBe(expected);
			},
		);
	});
});

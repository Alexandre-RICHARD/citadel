import { describe, expect, it } from "vitest";

import { getMondayBasedWeekday } from "./getMondayBasedWeekday.ts";

describe("getMondayBasedWeekday.ts", () => {
	describe("weekdays", () => {
		it.each([
			{ isoDate: "2026-10-26", day: "Monday", expected: 0 },
			{ isoDate: "2026-10-28", day: "Wednesday", expected: 2 },
			{ isoDate: "2026-11-01", day: "Sunday", expected: 6 },
		] as const)(
			"SHOULD return $expected WHEN the day is a $day",
			({ isoDate, expected }) => {
				expect(getMondayBasedWeekday(isoDate)).toBe(expected);
			},
		);
	});
});

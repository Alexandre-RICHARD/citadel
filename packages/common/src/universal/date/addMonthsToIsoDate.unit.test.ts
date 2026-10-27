import { describe, expect, it } from "vitest";

import { addMonthsToIsoDate } from "./addMonthsToIsoDate.ts";

describe("addMonthsToIsoDate.ts", () => {
	describe("same day", () => {
		it("SHOULD keep the day WHEN it exists in the target month", () => {
			expect(addMonthsToIsoDate("2024-01-15", 1)).toBe("2024-02-15");
		});

		it("SHOULD move to the next year WHEN the months go past December", () => {
			expect(addMonthsToIsoDate("2024-11-15", 3)).toBe("2025-02-15");
		});

		it("SHOULD move back WHEN the months are negative", () => {
			expect(addMonthsToIsoDate("2024-01-15", -12)).toBe("2023-01-15");
		});
	});

	describe("missing day", () => {
		it.each([
			{ isoDate: "2023-01-31", expected: "2023-02-28" },
			{ isoDate: "2024-01-31", expected: "2024-02-29" },
			{ isoDate: "2024-03-31", expected: "2024-04-30" },
		] as const)(
			"SHOULD clamp to the last day of the month WHEN $isoDate has no equivalent",
			({ isoDate, expected }) => {
				expect(addMonthsToIsoDate(isoDate, 1)).toBe(expected);
			},
		);
	});
});

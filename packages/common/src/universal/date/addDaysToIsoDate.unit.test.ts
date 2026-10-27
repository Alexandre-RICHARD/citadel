import { describe, expect, it } from "vitest";

import { addDaysToIsoDate } from "./addDaysToIsoDate.ts";

describe("addDaysToIsoDate.ts", () => {
	describe("forward", () => {
		it("SHOULD move to the next month WHEN the days go past its end", () => {
			expect(addDaysToIsoDate("2024-01-30", 3)).toBe("2024-02-02");
		});

		it("SHOULD count the 29th of February WHEN the year is a leap year", () => {
			expect(addDaysToIsoDate("2024-02-28", 1)).toBe("2024-02-29");
		});

		it("SHOULD keep a 24 hour day WHEN the clocks change", () => {
			expect(addDaysToIsoDate("2024-03-30", 1)).toBe("2024-03-31");
		});
	});

	describe("backward", () => {
		it("SHOULD move to the previous year WHEN the days are negative", () => {
			expect(addDaysToIsoDate("2024-01-01", -1)).toBe("2023-12-31");
		});
	});
});

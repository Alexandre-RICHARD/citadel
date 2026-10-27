import { describe, expect, it } from "vitest";

import { formatLocalIsoDate } from "./formatLocalIsoDate.ts";

describe("formatLocalIsoDate.ts", () => {
	describe("local day", () => {
		it("SHOULD return the local day with padded month and day", () => {
			expect(formatLocalIsoDate(new Date(2019, 2, 5, 23, 59))).toBe(
				"2019-03-05",
			);
		});

		it("SHOULD pad the year to 4 digits WHEN it is before 1000", () => {
			const date = new Date(2000, 0, 1);
			date.setFullYear(987);

			expect(formatLocalIsoDate(date)).toBe("0987-01-01");
		});
	});
});

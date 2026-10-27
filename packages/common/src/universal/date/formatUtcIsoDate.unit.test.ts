import { describe, expect, it } from "vitest";

import { formatUtcIsoDate } from "./formatUtcIsoDate.ts";

describe("formatUtcIsoDate.ts", () => {
	describe("UTC day", () => {
		it("SHOULD return the UTC day of the date", () => {
			expect(formatUtcIsoDate(new Date(Date.UTC(2011, 8, 22)))).toBe(
				"2011-09-22",
			);
		});

		it("SHOULD keep the UTC day WHEN the time is late in the UTC day", () => {
			expect(formatUtcIsoDate(new Date("2011-09-22T23:59:59Z"))).toBe(
				"2011-09-22",
			);
		});
	});
});

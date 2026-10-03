import { describe, expect, it } from "vitest";

import { toDateTimeInputValue } from "./toDateTimeInputValue.ts";

describe("toDateTimeInputValue.ts", () => {
	describe("valid date", () => {
		it("SHOULD return the local day and minute as YYYY-MM-DDTHH:MM with padded parts", () => {
			expect(toDateTimeInputValue(new Date(2019, 2, 5, 7, 4, 59))).toBe(
				"2019-03-05T07:04",
			);
		});

		it("SHOULD accept an ISO string", () => {
			expect(
				toDateTimeInputValue(new Date(2011, 11, 31, 23, 30).toISOString()),
			).toBe("2011-12-31T23:30");
		});
	});

	describe("invalid date", () => {
		it("SHOULD return an empty string, which empties the input, WHEN the date is invalid", () => {
			expect(toDateTimeInputValue("not a date")).toBe("");
		});
	});
});

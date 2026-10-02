import { describe, expect, it } from "vitest";

import { mapDateToString } from "./mapDateToString.ts";

describe("mapDateToString.ts", () => {
	describe("valid date", () => {
		it("SHOULD return the ISO string in UTC with milliseconds", () => {
			expect(mapDateToString(new Date("2017-09-29T16:30:00.250+02:00"))).toBe(
				"2017-09-29T14:30:00.250Z",
			);
		});
	});

	describe("invalid date", () => {
		it("SHOULD throw WHEN the date is invalid", () => {
			expect(() => mapDateToString(new Date(Number.NaN))).toThrow(RangeError);
		});
	});
});

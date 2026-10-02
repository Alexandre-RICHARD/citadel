import { describe, expect, it } from "vitest";

import { mapStringToDate } from "./mapStringToDate.ts";

describe("mapStringToDate.ts", () => {
	describe("valid string", () => {
		it("SHOULD convert an ISO string with an offset to the same instant", () => {
			expect(
				mapStringToDate("2017-09-29T16:30:00.250+02:00").toISOString(),
			).toBe("2017-09-29T14:30:00.250Z");
		});
	});

	describe("invalid string", () => {
		it("SHOULD return an invalid date WHEN the string is not a date", () => {
			expect(Number.isNaN(mapStringToDate("yesterday").getTime())).toBe(true);
		});
	});
});

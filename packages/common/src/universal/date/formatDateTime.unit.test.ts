import { describe, expect, it } from "vitest";

import { formatDateTime } from "./formatDateTime.ts";

describe("formatDateTime.ts", () => {
	describe("valid date", () => {
		it("SHOULD write the abbreviated month and the time on 24 hours", () => {
			expect(formatDateTime(new Date(2011, 8, 22, 21, 5))).toBe(
				"22 sept. 2011, 21:05",
			);
		});

		it("SHOULD accept an ISO string", () => {
			expect(formatDateTime(new Date(2017, 10, 2, 8, 0).toISOString())).toBe(
				"02 nov. 2017, 08:00",
			);
		});
	});

	describe("missing or invalid date", () => {
		it.each([null, undefined, ""])(
			"SHOULD return null WHEN the date is %j",
			(value) => {
				expect(formatDateTime(value)).toBeNull();
			},
		);

		it("SHOULD return null WHEN the date is invalid", () => {
			expect(formatDateTime(new Date(Number.NaN))).toBeNull();
		});
	});
});

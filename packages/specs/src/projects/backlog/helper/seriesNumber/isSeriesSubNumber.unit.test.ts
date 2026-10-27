import { describe, expect, it } from "vitest";

import { isSeriesSubNumber } from "./isSeriesSubNumber.ts";

describe("isSeriesSubNumber.ts", () => {
	describe("series numbers", () => {
		it("SHOULD return false WHEN the number is an integer, a main game", () => {
			expect(isSeriesSubNumber(7)).toBe(false);
		});

		it.each([7.1, 7.01, 7.001])(
			"SHOULD return true WHEN the number is %s",
			(seriesNumber) => {
				expect(isSeriesSubNumber(seriesNumber)).toBe(true);
			},
		);
	});
});

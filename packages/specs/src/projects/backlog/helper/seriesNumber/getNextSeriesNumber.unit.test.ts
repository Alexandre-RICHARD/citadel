import { describe, expect, it } from "vitest";

import { getNextSeriesNumber } from "./getNextSeriesNumber.ts";

describe("getNextSeriesNumber.ts", () => {
	describe("series with games", () => {
		it("SHOULD return the integer after the highest number", () => {
			expect(
				getNextSeriesNumber([
					{ gameId: 1, seriesNumber: 1 },
					{ gameId: 2, seriesNumber: 2 },
				]),
			).toBe(3);
		});

		it("SHOULD skip the sub games of the last family", () => {
			expect(
				getNextSeriesNumber([
					{ gameId: 1, seriesNumber: 2 },
					{ gameId: 2, seriesNumber: 2.5 },
				]),
			).toBe(3);
		});
	});

	describe("empty series", () => {
		it("SHOULD return 1 WHEN the series has no game", () => {
			expect(getNextSeriesNumber([])).toBe(1);
		});
	});
});

import { describe, expect, it } from "vitest";

import { formatSeriesNumber } from "./formatSeriesNumber.ts";

describe("formatSeriesNumber.ts", () => {
	describe("main games", () => {
		it("SHOULD show an integer without decimals", () => {
			expect(formatSeriesNumber(7, [])).toBe("7");
		});
	});

	describe("sub-games", () => {
		it("SHOULD show as few decimals as possible", () => {
			expect(formatSeriesNumber(7.1, [{ gameId: 1, seriesNumber: 7.1 }])).toBe(
				"7.1",
			);
		});

		it("SHOULD show as many decimals as the most precise sub-game of the family", () => {
			expect(
				formatSeriesNumber(3.1, [
					{ gameId: 1, seriesNumber: 3.01 },
					{ gameId: 2, seriesNumber: 3.1 },
				]),
			).toBe("3.10");
		});

		it("SHOULD ignore the sub-games of another family", () => {
			expect(
				formatSeriesNumber(3.1, [
					{ gameId: 1, seriesNumber: 4.01 },
					{ gameId: 2, seriesNumber: 3.1 },
				]),
			).toBe("3.1");
		});
	});
});

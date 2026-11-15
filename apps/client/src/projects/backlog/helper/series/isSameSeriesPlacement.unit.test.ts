import { describe, expect, it } from "vitest";

import { isSameSeriesPlacement } from "./isSameSeriesPlacement";

const IN_SERIES = { series: { id: 4 }, seriesNumber: 2 };
const NO_SERIES = { series: null, seriesNumber: null };

describe("isSameSeriesPlacement.ts", () => {
	describe("kept placement", () => {
		it("SHOULD be true WHEN the series and the number are the same", () => {
			// Act
			const isSame = isSameSeriesPlacement(IN_SERIES, {
				series: { id: 4 },
				seriesNumber: 2,
			});

			// Assert
			expect(isSame).toBe(true);
		});

		it("SHOULD be true WHEN the game stays outside any series", () => {
			// Act
			const isSame = isSameSeriesPlacement(NO_SERIES, NO_SERIES);

			// Assert
			expect(isSame).toBe(true);
		});
	});

	describe("changed placement", () => {
		it("SHOULD be false WHEN the game moves to another series", () => {
			// Act
			const isSame = isSameSeriesPlacement(IN_SERIES, {
				series: { id: 5 },
				seriesNumber: 2,
			});

			// Assert
			expect(isSame).toBe(false);
		});

		it("SHOULD be false WHEN the number changes in the same series", () => {
			// Act
			const isSame = isSameSeriesPlacement(IN_SERIES, {
				series: { id: 4 },
				seriesNumber: 3,
			});

			// Assert
			expect(isSame).toBe(false);
		});

		it("SHOULD be false WHEN the game joins or leaves a series", () => {
			// Act
			const joins = isSameSeriesPlacement(NO_SERIES, IN_SERIES);
			const leaves = isSameSeriesPlacement(IN_SERIES, NO_SERIES);

			// Assert
			expect([joins, leaves]).toStrictEqual([false, false]);
		});
	});
});

import { describe, expect, it } from "vitest";

import { sortSeriesEntries } from "./sortSeriesEntries.ts";

describe("sortSeriesEntries.ts", () => {
	describe("order", () => {
		it("SHOULD sort the games by number", () => {
			expect(
				sortSeriesEntries([
					{ gameId: 1, seriesNumber: 2 },
					{ gameId: 2, seriesNumber: 1.1 },
					{ gameId: 3, seriesNumber: 1 },
				]).map(({ gameId }) => gameId),
			).toStrictEqual([3, 2, 1]);
		});

		it("SHOULD leave the original list untouched", () => {
			const entries = [
				{ gameId: 1, seriesNumber: 2 },
				{ gameId: 2, seriesNumber: 1 },
			];

			sortSeriesEntries(entries);

			expect(entries.map(({ gameId }) => gameId)).toStrictEqual([1, 2]);
		});
	});
});

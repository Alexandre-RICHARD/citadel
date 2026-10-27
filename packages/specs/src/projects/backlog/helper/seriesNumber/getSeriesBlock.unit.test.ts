import { describe, expect, it } from "vitest";

import { getSeriesBlock } from "./getSeriesBlock.ts";

const ENTRIES = [
	{ gameId: 1, seriesNumber: 1 },
	{ gameId: 2, seriesNumber: 1.1 },
	{ gameId: 3, seriesNumber: 1.2 },
	{ gameId: 4, seriesNumber: 2 },
];

describe("getSeriesBlock.ts", () => {
	describe("main game", () => {
		it("SHOULD bring the sub games of its family", () => {
			expect(
				getSeriesBlock(ENTRIES, 1).map(({ gameId }) => gameId),
			).toStrictEqual([1, 2, 3]);
		});

		it("SHOULD move alone WHEN its family has no sub game", () => {
			expect(
				getSeriesBlock(ENTRIES, 4).map(({ gameId }) => gameId),
			).toStrictEqual([4]);
		});
	});

	describe("sub game", () => {
		it("SHOULD move alone", () => {
			expect(
				getSeriesBlock(ENTRIES, 2).map(({ gameId }) => gameId),
			).toStrictEqual([2]);
		});
	});

	describe("missing game", () => {
		it("SHOULD return an empty block WHEN the game is not in the series", () => {
			expect(getSeriesBlock(ENTRIES, 99)).toStrictEqual([]);
		});
	});
});

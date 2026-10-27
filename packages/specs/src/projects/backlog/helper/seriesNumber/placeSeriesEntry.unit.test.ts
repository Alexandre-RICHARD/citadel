import { describe, expect, it } from "vitest";

import { placeSeriesEntry } from "./placeSeriesEntry.ts";

describe("placeSeriesEntry.ts", () => {
	describe("new games", () => {
		it("SHOULD push the game that had the number, and the next ones", () => {
			expect(
				placeSeriesEntry(
					[
						{ gameId: 1, seriesNumber: 1 },
						{ gameId: 2, seriesNumber: 2 },
						{ gameId: 3, seriesNumber: 3 },
					],
					4,
					2,
				),
			).toStrictEqual([
				{ gameId: 1, seriesNumber: 1 },
				{ gameId: 4, seriesNumber: 2 },
				{ gameId: 2, seriesNumber: 3 },
				{ gameId: 3, seriesNumber: 4 },
			]);
		});

		it("SHOULD keep the other numbers WHEN the number is free", () => {
			expect(
				placeSeriesEntry([{ gameId: 1, seriesNumber: 1 }], 2, 5),
			).toStrictEqual([
				{ gameId: 1, seriesNumber: 1 },
				{ gameId: 2, seriesNumber: 5 },
			]);
		});
	});

	describe("games already in the series", () => {
		it("SHOULD bring its sub-games along WHEN a main game takes another number", () => {
			expect(
				placeSeriesEntry(
					[
						{ gameId: 1, seriesNumber: 1 },
						{ gameId: 2, seriesNumber: 1.1 },
						{ gameId: 3, seriesNumber: 2 },
					],
					1,
					3,
				),
			).toStrictEqual([
				{ gameId: 3, seriesNumber: 2 },
				{ gameId: 1, seriesNumber: 3 },
				{ gameId: 2, seriesNumber: 3.1 },
			]);
		});

		it("SHOULD place its sub-games after it WHEN a main game becomes a sub-game", () => {
			expect(
				placeSeriesEntry(
					[
						{ gameId: 1, seriesNumber: 1 },
						{ gameId: 2, seriesNumber: 2 },
						{ gameId: 3, seriesNumber: 2.1 },
					],
					2,
					1.1,
				),
			).toStrictEqual([
				{ gameId: 1, seriesNumber: 1 },
				{ gameId: 2, seriesNumber: 1.1 },
				{ gameId: 3, seriesNumber: 1.2 },
			]);
		});
	});
});

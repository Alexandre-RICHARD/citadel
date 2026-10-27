import { describe, expect, it } from "vitest";

import { getSeriesNumbersByGame } from "../../../../testUtils/getSeriesNumbersByGame.ts";
import { insertFamily } from "./insertFamily.ts";

const MAIN = 98;
const SUB = 99;

describe("insertFamily.ts", () => {
	describe("free family", () => {
		it("SHOULD give the family number to the main game WHEN no main game has it", () => {
			expect(
				getSeriesNumbersByGame(
					insertFamily(
						[{ gameId: 1, seriesNumber: 1 }],
						[{ gameId: MAIN, seriesNumber: 5 }],
						2,
						1,
					),
				),
			).toStrictEqual({ 1: 1, [MAIN]: 2 });
		});

		it("SHOULD keep the orphan sub games already there", () => {
			expect(
				getSeriesNumbersByGame(
					insertFamily(
						[{ gameId: 1, seriesNumber: 2.1 }],
						[{ gameId: MAIN, seriesNumber: 5 }],
						2,
						1,
					),
				),
			).toStrictEqual({ 1: 2.1, [MAIN]: 2 });
		});
	});

	describe("taken family", () => {
		it("SHOULD push the family already there forward WHEN the direction is 1", () => {
			const entries = [
				{ gameId: 1, seriesNumber: 2 },
				{ gameId: 2, seriesNumber: 2.1 },
			];

			expect(
				getSeriesNumbersByGame(
					insertFamily(entries, [{ gameId: MAIN, seriesNumber: 5 }], 2, 1),
				),
			).toStrictEqual({ 1: 3, 2: 3.1, [MAIN]: 2 });
		});

		it("SHOULD push the family already there back WHEN the direction is -1", () => {
			expect(
				getSeriesNumbersByGame(
					insertFamily(
						[{ gameId: 1, seriesNumber: 2 }],
						[{ gameId: MAIN, seriesNumber: 5 }],
						2,
						-1,
					),
				),
			).toStrictEqual({ 1: 1, [MAIN]: 2 });
		});
	});

	describe("sub games of the block", () => {
		it("SHOULD keep the rank of each sub game in the new family", () => {
			expect(
				getSeriesNumbersByGame(
					insertFamily(
						[],
						[
							{ gameId: MAIN, seriesNumber: 5 },
							{ gameId: SUB, seriesNumber: 5.3 },
						],
						2,
						1,
					),
				),
			).toStrictEqual({ [MAIN]: 2, [SUB]: 2.3 });
		});
	});

	describe("empty block", () => {
		it("SHOULD keep the entries WHEN there is no game to place", () => {
			const entries = [{ gameId: 1, seriesNumber: 1 }];

			expect(insertFamily(entries, [], 2, 1)).toStrictEqual(entries);
		});
	});
});

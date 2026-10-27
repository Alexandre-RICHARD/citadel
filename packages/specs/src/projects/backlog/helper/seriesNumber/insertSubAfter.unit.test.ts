import { describe, expect, it } from "vitest";

import { getSeriesNumbersByGame } from "../../../../testUtils/getSeriesNumbersByGame.ts";
import { insertSubAfter } from "./insertSubAfter.ts";

const NEW_GAME = 99;
const ENTRIES = [
	{ gameId: 1, seriesNumber: 3 },
	{ gameId: 2, seriesNumber: 3.1 },
	{ gameId: 3, seriesNumber: 3.2 },
];

describe("insertSubAfter.ts", () => {
	describe("after a sub game", () => {
		it("SHOULD take the next rank and push the following sub games", () => {
			expect(
				getSeriesNumbersByGame(insertSubAfter(ENTRIES, NEW_GAME, 3, 2)),
			).toStrictEqual({ 1: 3, 2: 3.1, 3: 3.3, [NEW_GAME]: 3.2 });
		});
	});

	describe("after the main game", () => {
		it("SHOULD take the first rank", () => {
			expect(
				getSeriesNumbersByGame(insertSubAfter(ENTRIES, NEW_GAME, 3, 1)),
			).toStrictEqual({ 1: 3, 2: 3.2, 3: 3.3, [NEW_GAME]: 3.1 });
		});
	});

	describe("after the last rank", () => {
		it("SHOULD widen the family WHEN the previous game is at the last rank", () => {
			expect(
				getSeriesNumbersByGame(
					insertSubAfter([{ gameId: 1, seriesNumber: 3.9 }], NEW_GAME, 3, 1),
				),
			).toStrictEqual({ 1: 3.09, [NEW_GAME]: 3.1 });
		});
	});
});

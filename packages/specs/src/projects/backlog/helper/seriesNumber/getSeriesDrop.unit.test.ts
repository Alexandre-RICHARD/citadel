import { describe, expect, it } from "vitest";

import { getSeriesDrop } from "./getSeriesDrop.ts";

// Dans l'ordre affiché : 1, son sous-jeu 1.1, puis 2 et 3
const ENTRIES = [
	{ gameId: 1, seriesNumber: 1 },
	{ gameId: 2, seriesNumber: 1.1 },
	{ gameId: 3, seriesNumber: 2 },
	{ gameId: 4, seriesNumber: 3 },
];

describe("getSeriesDrop.ts", () => {
	describe("moved block", () => {
		it("SHOULD set aside the dragged main game and its sub games", () => {
			const drop = getSeriesDrop(ENTRIES, 1, 4, false);

			expect(drop.block.map(({ gameId }) => gameId)).toStrictEqual([1, 2]);
			expect(drop.rest.map(({ gameId }) => gameId)).toStrictEqual([3, 4]);
		});
	});

	describe("game above the gap", () => {
		it("SHOULD find no game above WHEN the gap is at the top", () => {
			expect(getSeriesDrop(ENTRIES, 4, 0, true).above).toBeNull();
		});

		it("SHOULD find the game above, the dragged block left out", () => {
			expect(getSeriesDrop(ENTRIES, 1, 4, false).above?.gameId).toBe(4);
		});
	});

	describe("level", () => {
		it("SHOULD be a main game WHEN the gap is at the top, even shifted right", () => {
			expect(getSeriesDrop(ENTRIES, 4, 0, true).isSub).toBe(false);
		});

		it("SHOULD be a sub game WHEN the gap is inside a family, even not shifted", () => {
			expect(getSeriesDrop(ENTRIES, 4, 1, false).isSub).toBe(true);
		});

		it.each([true, false])(
			"SHOULD follow the shift WHEN the gap is between two families and the shift is %s",
			(wantsSub) => {
				expect(getSeriesDrop(ENTRIES, 4, 2, wantsSub).isSub).toBe(wantsSub);
			},
		);
	});

	describe("direction", () => {
		it("SHOULD be moving down WHEN the gap is below the game", () => {
			expect(getSeriesDrop(ENTRIES, 1, 4, false).isMovingDown).toBe(true);
		});

		it("SHOULD be moving up WHEN the gap is above the game", () => {
			expect(getSeriesDrop(ENTRIES, 4, 0, false).isMovingDown).toBe(false);
		});
	});
});

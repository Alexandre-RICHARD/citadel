import { describe, expect, it } from "vitest";

import { getSeriesNumbersByGame } from "../../../../testUtils/getSeriesNumbersByGame.ts";
import { insertSub } from "./insertSub.ts";

const NEW_GAME = 99;

describe("insertSub.ts", () => {
	describe("free rank", () => {
		it("SHOULD place the game WHEN its rank is free", () => {
			const entries = [{ gameId: 1, seriesNumber: 3.1 }];

			expect(
				getSeriesNumbersByGame(insertSub(entries, NEW_GAME, 3, 300, 1)),
			).toStrictEqual({ 1: 3.1, [NEW_GAME]: 3.3 });
		});
	});

	describe("taken rank", () => {
		it("SHOULD push the colliding sub games forward WHEN the direction is 1", () => {
			const entries = [
				{ gameId: 1, seriesNumber: 3.1 },
				{ gameId: 2, seriesNumber: 3.2 },
				{ gameId: 3, seriesNumber: 3.5 },
			];

			expect(
				getSeriesNumbersByGame(insertSub(entries, NEW_GAME, 3, 100, 1)),
			).toStrictEqual({ 1: 3.2, 2: 3.3, 3: 3.5, [NEW_GAME]: 3.1 });
		});

		it("SHOULD push the colliding sub game back WHEN the direction is -1", () => {
			const entries = [
				{ gameId: 1, seriesNumber: 3.1 },
				{ gameId: 2, seriesNumber: 3.3 },
			];

			expect(
				getSeriesNumbersByGame(insertSub(entries, NEW_GAME, 3, 300, -1)),
			).toStrictEqual({ 1: 3.1, 2: 3.2, [NEW_GAME]: 3.3 });
		});
	});

	describe("last rank", () => {
		it("SHOULD widen the family WHEN pushing goes past the last rank", () => {
			const entries = [3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9].map(
				(seriesNumber, index) => ({ gameId: index + 1, seriesNumber }),
			);

			const placed = getSeriesNumbersByGame(
				insertSub(entries, NEW_GAME, 3, 900, 1),
			);

			expect(placed).toMatchObject({
				1: 3.01,
				8: 3.08,
				9: 3.1,
				[NEW_GAME]: 3.09,
			});
		});

		it("SHOULD return null WHEN the family cannot widen anymore", () => {
			expect(
				insertSub([{ gameId: 1, seriesNumber: 3.999 }], NEW_GAME, 3, 999, 1),
			).toBeNull();
		});
	});
});

import { describe, expect, it } from "vitest";

import { getSeriesNumbersByGame } from "../../../../testUtils/getSeriesNumbersByGame.ts";
import { insertSubsAfter } from "./insertSubsAfter.ts";

describe("insertSubsAfter.ts", () => {
	describe("several games", () => {
		it("SHOULD place the games one after the other, in their order", () => {
			const entries = [
				{ gameId: 1, seriesNumber: 3 },
				{ gameId: 2, seriesNumber: 3.1 },
			];
			const items = [
				{ gameId: 10, seriesNumber: 7.4 },
				{ gameId: 11, seriesNumber: 7.5 },
			];

			expect(
				getSeriesNumbersByGame(insertSubsAfter(entries, items, 3, 1)),
			).toStrictEqual({ 1: 3, 2: 3.3, 10: 3.1, 11: 3.2 });
		});
	});

	describe("no game", () => {
		it("SHOULD keep the entries WHEN there is nothing to place", () => {
			const entries = [{ gameId: 1, seriesNumber: 3 }];

			expect(insertSubsAfter(entries, [], 3, 1)).toStrictEqual(entries);
		});
	});
});

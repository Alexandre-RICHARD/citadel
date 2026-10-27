import { describe, expect, it } from "vitest";

import { getSeriesNumbersByGame } from "../../../../testUtils/getSeriesNumbersByGame.ts";
import { shiftFamilies } from "./shiftFamilies.ts";

describe("shiftFamilies.ts", () => {
	describe("forward", () => {
		it("SHOULD move the family with its sub games, and the next ones until a free number", () => {
			const entries = [
				{ gameId: 1, seriesNumber: 2 },
				{ gameId: 2, seriesNumber: 2.1 },
				{ gameId: 3, seriesNumber: 3 },
				{ gameId: 4, seriesNumber: 5 },
			];

			expect(
				getSeriesNumbersByGame(shiftFamilies(entries, 2, 1)),
			).toStrictEqual({
				1: 3,
				2: 3.1,
				3: 4,
				4: 5,
			});
		});
	});

	describe("backward", () => {
		it("SHOULD move the family and the previous ones until a free number", () => {
			const entries = [
				{ gameId: 1, seriesNumber: 2 },
				{ gameId: 2, seriesNumber: 3 },
				{ gameId: 3, seriesNumber: 5 },
			];

			expect(
				getSeriesNumbersByGame(shiftFamilies(entries, 3, -1)),
			).toStrictEqual({ 1: 1, 2: 2, 3: 5 });
		});
	});

	describe("free family", () => {
		it("SHOULD move nothing WHEN the family is free", () => {
			const entries = [{ gameId: 1, seriesNumber: 4 }];

			expect(shiftFamilies(entries, 2, 1)).toStrictEqual(entries);
		});
	});
});

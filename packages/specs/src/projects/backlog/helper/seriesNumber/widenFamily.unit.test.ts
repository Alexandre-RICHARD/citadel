import { describe, expect, it } from "vitest";

import { getSeriesNumbersByGame } from "../../../../testUtils/getSeriesNumbersByGame.ts";
import { widenFamily } from "./widenFamily.ts";

describe("widenFamily.ts", () => {
	describe("widening", () => {
		it("SHOULD give one more digit to the sub games of the family, ranks kept", () => {
			const entries = [
				{ gameId: 1, seriesNumber: 3 },
				{ gameId: 2, seriesNumber: 3.1 },
				{ gameId: 3, seriesNumber: 3.9 },
				{ gameId: 4, seriesNumber: 4.1 },
			];

			expect(getSeriesNumbersByGame(widenFamily(entries, 3))).toStrictEqual({
				1: 3,
				2: 3.01,
				3: 3.09,
				4: 4.1,
			});
		});
	});

	describe("full precision", () => {
		it("SHOULD return null WHEN the family already has 3 digits", () => {
			expect(widenFamily([{ gameId: 1, seriesNumber: 3.001 }], 3)).toBeNull();
		});
	});
});

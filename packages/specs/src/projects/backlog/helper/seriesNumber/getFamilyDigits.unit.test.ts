import { describe, expect, it } from "vitest";

import { getFamilyDigits } from "./getFamilyDigits.ts";

const ENTRIES = [
	{ gameId: 1, seriesNumber: 3 },
	{ gameId: 2, seriesNumber: 3.1 },
	{ gameId: 3, seriesNumber: 3.15 },
	{ gameId: 4, seriesNumber: 4.001 },
	{ gameId: 5, seriesNumber: 5 },
];

describe("getFamilyDigits.ts", () => {
	describe("family with sub games", () => {
		it("SHOULD return the digits of the most precise sub game", () => {
			expect(getFamilyDigits(ENTRIES, 3)).toBe(2);
		});

		it("SHOULD return 3 WHEN a sub game has 3 digits", () => {
			expect(getFamilyDigits(ENTRIES, 4)).toBe(3);
		});
	});

	describe("family without sub games", () => {
		it.each([
			{ reason: "it has only its main game", family: 5 },
			{ reason: "it has no game", family: 9 },
		])("SHOULD return 1 WHEN $reason", ({ family }) => {
			expect(getFamilyDigits(ENTRIES, family)).toBe(1);
		});
	});
});

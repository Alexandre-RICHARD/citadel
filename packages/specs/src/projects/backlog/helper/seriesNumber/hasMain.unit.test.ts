import { describe, expect, it } from "vitest";

import { hasMain } from "./hasMain.ts";

const ENTRIES = [
	{ gameId: 1, seriesNumber: 3 },
	{ gameId: 2, seriesNumber: 3.1 },
	{ gameId: 3, seriesNumber: 5.2 },
];

describe("hasMain.ts", () => {
	describe("main game", () => {
		it("SHOULD return true WHEN the family has its integer number", () => {
			expect(hasMain(ENTRIES, 3)).toBe(true);
		});

		it.each([
			{ reason: "the family has only sub games", family: 5 },
			{ reason: "the family has no game", family: 6 },
		])("SHOULD return false WHEN $reason", ({ family }) => {
			expect(hasMain(ENTRIES, family)).toBe(false);
		});
	});
});

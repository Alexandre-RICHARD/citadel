import { describe, expect, it } from "vitest";

import { isSubPartUsed } from "./isSubPartUsed.ts";

const ENTRIES = [
	{ gameId: 1, seriesNumber: 3.1 },
	{ gameId: 2, seriesNumber: 4.2 },
];

describe("isSubPartUsed.ts", () => {
	describe("ranks", () => {
		it("SHOULD return true WHEN a game of the family has the rank", () => {
			expect(isSubPartUsed(ENTRIES, 3, 100)).toBe(true);
		});

		it("SHOULD return false WHEN no game of the family has the rank", () => {
			expect(isSubPartUsed(ENTRIES, 3, 200)).toBe(false);
		});

		it("SHOULD return false WHEN only another family has the rank", () => {
			expect(isSubPartUsed(ENTRIES, 4, 100)).toBe(false);
		});
	});
});

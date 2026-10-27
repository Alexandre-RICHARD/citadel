import { describe, expect, it } from "vitest";

import { normalizeForSearch } from "./normalizeForSearch.ts";

describe("normalizeForSearch.ts", () => {
	describe("normalization", () => {
		it("SHOULD remove accents and upper case", () => {
			expect(normalizeForSearch("Avrillé ARDENNE")).toBe("avrille ardenne");
		});

		it("SHOULD replace each run of punctuation with a single space", () => {
			expect(normalizeForSearch("Foch - Maison/Bleue")).toBe(
				"foch maison bleue",
			);
		});

		it("SHOULD trim the spaces left at both ends", () => {
			expect(normalizeForSearch("  « Lorraine »  ")).toBe("lorraine");
		});
	});
});

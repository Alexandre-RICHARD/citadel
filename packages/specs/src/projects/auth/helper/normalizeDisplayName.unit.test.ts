import { describe, expect, it } from "vitest";

import { normalizeDisplayName } from "./normalizeDisplayName.ts";

describe("normalizeDisplayName.ts", () => {
	describe("spaces", () => {
		it("SHOULD remove the spaces at both ends", () => {
			expect(normalizeDisplayName("  Alex  ")).toBe("Alex");
		});

		it("SHOULD keep a single space WHEN several follow each other", () => {
			expect(normalizeDisplayName("Alex     le Grand")).toBe("Alex le Grand");
		});
	});

	describe("characters", () => {
		it("SHOULD compose an accent typed in two keys WHEN normalizing", () => {
			expect(normalizeDisplayName("Élodie")).toBe("Élodie");
		});

		it("SHOULD keep symbols and emojis untouched", () => {
			expect(normalizeDisplayName("Alex ★ 🎮")).toBe("Alex ★ 🎮");
		});
	});
});

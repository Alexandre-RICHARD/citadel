import { describe, expect, it } from "vitest";

import { normalizeMediaTitle } from "./normalizeMediaTitle.ts";

describe("normalizeMediaTitle.ts", () => {
	describe("comparable titles", () => {
		it("SHOULD drop accents, case and punctuation", () => {
			expect(normalizeMediaTitle("L'Âge de glace : la dérive")).toBe(
				"l age de glace la derive",
			);
		});

		it("SHOULD read an ampersand as « and »", () => {
			expect(normalizeMediaTitle("Fast & Furious")).toBe("fast and furious");
		});
	});
});

import { describe, expect, it } from "vitest";

import { capitalizeFirstLetter } from "./capitalizeFirstLetter.ts";

describe("capitalizeFirstLetter.ts", () => {
	describe("text", () => {
		it("SHOULD put only the first letter in upper case", () => {
			expect(capitalizeFirstLetter("le nom est vide")).toBe("Le nom est vide");
		});

		it("SHOULD handle an accented first letter", () => {
			expect(capitalizeFirstLetter("été")).toBe("Été");
		});

		it("SHOULD return an empty string WHEN the text is empty", () => {
			expect(capitalizeFirstLetter("")).toBe("");
		});
	});
});

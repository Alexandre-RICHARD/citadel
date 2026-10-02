import { describe, expect, it } from "vitest";

import { stringConvertor } from "./stringConvertor.ts";

describe("stringConvertor.ts", () => {
	describe("normalization", () => {
		it("SHOULD lowercase the string", () => {
			expect(stringConvertor("Hollow KNIGHT")).toBe("hollow knight");
		});

		it("SHOULD replace every underscore and hyphen with a space", () => {
			expect(stringConvertor("Build_Smelter-Mk1_C")).toBe(
				"build smelter mk1 c",
			);
		});

		it("SHOULD trim the spaces at both ends, including those coming from separators", () => {
			expect(stringConvertor("  _Celeste-  ")).toBe("celeste");
		});

		it("SHOULD keep the spaces inside the string", () => {
			expect(stringConvertor("Dead  Cells")).toBe("dead  cells");
		});

		it("SHOULD return an empty string WHEN the string is empty", () => {
			expect(stringConvertor("")).toBe("");
		});
	});
});

import { describe, expect, it } from "vitest";

import { getSortStringValue } from "./getSortStringValue.ts";

describe("getSortStringValue.ts", () => {
	describe("comparison", () => {
		it("SHOULD return -1 WHEN the first string comes first", () => {
			expect(getSortStringValue("Celeste", "Cuphead")).toBe(-1);
		});

		it("SHOULD return 1 WHEN the first string comes last", () => {
			expect(getSortStringValue("Fez", "Dead Cells")).toBe(1);
		});

		it("SHOULD return 0 WHEN the strings are equal", () => {
			expect(getSortStringValue("Fez", "Fez")).toBe(0);
		});

		it("SHOULD sort the arrays alphabetically WHEN used with sort", () => {
			expect(
				["Hades", "Celeste", "Fez"].sort(getSortStringValue),
			).toStrictEqual(["Celeste", "Fez", "Hades"]);
		});

		it("SHOULD put a prefix before the longer string", () => {
			expect(getSortStringValue("Dark Souls", "Dark Souls II")).toBe(-1);
		});
	});

	describe("code unit order", () => {
		it("SHOULD sort every uppercase letter before the lowercase ones", () => {
			expect(getSortStringValue("Zelda", "celeste")).toBe(-1);
		});

		it("SHOULD sort accented letters after z", () => {
			expect(getSortStringValue("Ēnder Lilies", "Zelda")).toBe(1);
		});
	});
});

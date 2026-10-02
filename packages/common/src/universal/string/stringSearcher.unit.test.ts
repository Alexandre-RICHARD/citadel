import { describe, expect, it } from "vitest";

import { stringSearcher } from "./stringSearcher.ts";

describe("stringSearcher.ts", () => {
	describe("default mode", () => {
		it("SHOULD find the search WHEN the case differs", () => {
			expect(
				stringSearcher({ searchString: "SMELTER", value: "Build_Smelter_C" }),
			).toBe(true);
		});

		it("SHOULD treat underscores, hyphens and spaces as the same separator", () => {
			expect(
				stringSearcher({
					searchString: "iron-plate",
					value: "Desc_Iron_Plate_C",
				}),
			).toBe(true);
		});

		it("SHOULD ignore the spaces around the search", () => {
			expect(
				stringSearcher({ searchString: "  plate ", value: "Iron Plate" }),
			).toBe(true);
		});

		it("SHOULD return false WHEN the value does not contain the search", () => {
			expect(
				stringSearcher({ searchString: "copper", value: "Iron Plate" }),
			).toBe(false);
		});

		it("SHOULD match everything WHEN the search is empty", () => {
			expect(stringSearcher({ searchString: "", value: "Iron Plate" })).toBe(
				true,
			);
		});
	});

	describe("strict mode", () => {
		it("SHOULD find the search WHEN it is written exactly the same", () => {
			expect(
				stringSearcher({
					searchString: "Plate",
					value: "Iron Plate",
					strictMode: true,
				}),
			).toBe(true);
		});

		it("SHOULD return false WHEN only the case differs", () => {
			expect(
				stringSearcher({
					searchString: "plate",
					value: "Iron Plate",
					strictMode: true,
				}),
			).toBe(false);
		});

		it("SHOULD return false WHEN only the separators differ", () => {
			expect(
				stringSearcher({
					searchString: "Iron Plate",
					value: "Iron_Plate",
					strictMode: true,
				}),
			).toBe(false);
		});
	});
});

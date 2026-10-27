import { describe, expect, it } from "vitest";

import { findFrenchName } from "./findFrenchName.ts";

describe("findFrenchName.ts", () => {
	describe("French title", () => {
		it("SHOULD return the first alternative name tagged as French", () => {
			expect(
				findFrenchName("Final Fantasy VII", [
					{ id: 1, name: "FF7", comment: "Abbreviation" },
					{ id: 2, name: "  Final Fantasy 7  ", comment: "French Title" },
				]),
			).toBe("Final Fantasy 7");
		});
	});

	describe("no French title", () => {
		it.each([
			{
				reason: "no alternative name is French",
				alternativeNames: [{ id: 1, name: "FF7", comment: "Abbreviation" }],
			},
			{
				reason: "the French name is the original name",
				alternativeNames: [
					{ id: 1, name: "final fantasy vii", comment: "French title" },
				],
			},
			{
				reason: "the French name is blank",
				alternativeNames: [{ id: 1, name: " ", comment: "French title" }],
			},
			{ reason: "there is no alternative name", alternativeNames: undefined },
		])("SHOULD return null WHEN $reason", ({ alternativeNames }) => {
			expect(findFrenchName("Final Fantasy VII", alternativeNames)).toBeNull();
		});
	});
});

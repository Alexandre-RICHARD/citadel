import { describe, expect, it } from "vitest";

import { replaceById } from "./replaceById";

const ITEMS = [
	{ id: 1, name: "Hades" },
	{ id: 2, name: "Celeste" },
];

describe("replaceById.ts", () => {
	describe("matching item", () => {
		it("SHOULD transform only the item with the id, in a new list", () => {
			const result = replaceById(ITEMS, 2, (item) => ({
				...item,
				name: "Tunic",
			}));

			expect(result).toStrictEqual([
				{ id: 1, name: "Hades" },
				{ id: 2, name: "Tunic" },
			]);
			expect(ITEMS[1]?.name).toBe("Celeste");
		});
	});

	describe("missing item", () => {
		it("SHOULD return the same items WHEN no item has the id", () => {
			expect(replaceById(ITEMS, 9, () => ({ id: 9, name: "?" }))).toStrictEqual(
				ITEMS,
			);
		});
	});
});

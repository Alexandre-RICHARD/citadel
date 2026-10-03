import { describe, expect, it } from "vitest";

import { locateById } from "./locateById";

describe("locateById.ts", () => {
	describe("found item", () => {
		it("SHOULD return the item and its index", () => {
			expect(locateById([{ id: 4 }, { id: 7 }], 7)).toStrictEqual({
				item: { id: 7 },
				index: 1,
			});
		});
	});

	describe("missing item", () => {
		it.each([
			{ reason: "no item has the id", items: [{ id: 4 }] },
			{ reason: "the list is not loaded", items: undefined },
		])("SHOULD return null WHEN $reason", ({ items }) => {
			expect(locateById(items, 7)).toBeNull();
		});
	});
});

import { describe, expect, it } from "vitest";

import { toggleArrayItem } from "./toggleArrayItem.ts";

describe("toggleArrayItem.ts", () => {
	describe("missing item", () => {
		it("SHOULD add the item at the end WHEN it is not in the list", () => {
			expect(toggleArrayItem([1, 2], 3)).toStrictEqual([1, 2, 3]);
		});
	});

	describe("present item", () => {
		it("SHOULD remove every occurrence of the item WHEN it is in the list", () => {
			expect(toggleArrayItem([1, 2, 1], 1)).toStrictEqual([2]);
		});

		it("SHOULD leave the original list untouched", () => {
			const items = [1, 2];

			toggleArrayItem(items, 1);

			expect(items).toStrictEqual([1, 2]);
		});
	});
});

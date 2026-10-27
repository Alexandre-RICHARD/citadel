import { describe, expect, it } from "vitest";

import { getUniqueValues } from "./getUniqueValues.ts";

describe("getUniqueValues.ts", () => {
	describe("duplicates", () => {
		it("SHOULD keep the first occurrence of each value, in order", () => {
			expect(getUniqueValues([3, 1, 3, 2, 1])).toStrictEqual([3, 1, 2]);
		});

		it("SHOULD compare objects by reference", () => {
			const item = { id: 1 };

			expect(getUniqueValues([item, item, { id: 1 }])).toHaveLength(2);
		});
	});

	describe("empty input", () => {
		it("SHOULD return an empty array WHEN there is no value", () => {
			expect(getUniqueValues([])).toStrictEqual([]);
		});
	});
});

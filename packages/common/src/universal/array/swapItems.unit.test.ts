import { describe, expect, it } from "vitest";

import { swapItems } from "./swapItems.ts";

describe("swapItems.ts", () => {
	describe("existing places", () => {
		it("SHOULD swap the two items", () => {
			expect(swapItems(["a", "b", "c"], 0, 2)).toStrictEqual(["c", "b", "a"]);
		});

		it("SHOULD leave the original list untouched", () => {
			const items = ["a", "b"];

			swapItems(items, 0, 1);

			expect(items).toStrictEqual(["a", "b"]);
		});
	});

	describe("missing place", () => {
		it.each([
			{ reason: "an index is negative", index: -1, otherIndex: 0 },
			{ reason: "an index is past the end", index: 1, otherIndex: 2 },
		])(
			"SHOULD return an unchanged copy WHEN $reason",
			({ index, otherIndex }) => {
				expect(swapItems(["a", "b"], index, otherIndex)).toStrictEqual([
					"a",
					"b",
				]);
			},
		);
	});
});

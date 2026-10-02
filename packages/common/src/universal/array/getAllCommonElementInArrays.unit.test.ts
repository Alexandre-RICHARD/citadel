import { describe, expect, it } from "vitest";

import { getAllCommonElementInArrays } from "./getAllCommonElementInArrays.ts";

describe("getAllCommonElementInArrays.ts", () => {
	describe("primitive elements", () => {
		it("SHOULD keep the elements of the first array that are in the second, in the first array order", () => {
			expect(
				getAllCommonElementInArrays([4, 1, 3, 2], [2, 3, 9]),
			).toStrictEqual([3, 2]);
		});

		it("SHOULD return an empty array WHEN nothing is shared", () => {
			expect(getAllCommonElementInArrays(["a", "b"], ["c"])).toStrictEqual([]);
		});

		it("SHOULD keep the duplicates of the first array", () => {
			expect(getAllCommonElementInArrays([1, 1, 2], [1])).toStrictEqual([1, 1]);
		});

		it("SHOULD return an empty array WHEN one of the arrays is empty", () => {
			expect(getAllCommonElementInArrays([], [1])).toStrictEqual([]);
			expect(getAllCommonElementInArrays([1], [])).toStrictEqual([]);
		});
	});

	describe("object elements", () => {
		it("SHOULD compare objects by content, not by reference", () => {
			expect(
				getAllCommonElementInArrays(
					[
						{ id: 1, tags: ["a"] },
						{ id: 2, tags: [] },
					],
					[{ id: 1, tags: ["a"] }],
				),
			).toStrictEqual([{ id: 1, tags: ["a"] }]);
		});

		it("SHOULD not match objects WHEN a nested value differs", () => {
			expect(
				getAllCommonElementInArrays(
					[{ id: 1, tags: ["a"] }],
					[{ id: 1, tags: ["b"] }],
				),
			).toStrictEqual([]);
		});
	});
});

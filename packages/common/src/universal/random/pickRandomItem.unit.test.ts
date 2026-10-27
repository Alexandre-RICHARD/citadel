import { afterEach, describe, expect, it, vi } from "vitest";

import { pickRandomItem } from "./pickRandomItem.ts";

describe("pickRandomItem.ts", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("filled list", () => {
		it.each([
			{ random: 0, expected: "a" },
			{ random: 0.5, expected: "b" },
			{ random: 0.999, expected: "c" },
		])(
			"SHOULD return $expected WHEN Math.random gives $random",
			({ random, expected }) => {
				vi.spyOn(Math, "random").mockReturnValue(random);

				expect(pickRandomItem(["a", "b", "c"])).toBe(expected);
			},
		);
	});

	describe("empty list", () => {
		it("SHOULD return undefined WHEN the list is empty", () => {
			expect(pickRandomItem([])).toBeUndefined();
		});
	});
});

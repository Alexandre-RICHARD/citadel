import { afterEach, describe, expect, it, vi } from "vitest";

import { randomBetween } from "./randomBetween.ts";

describe("randomBetween.ts", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("bounds", () => {
		it.each([
			{ random: 0, expected: 10 },
			{ random: 0.5, expected: 15 },
			{ random: 0.999, expected: 19.99 },
		])(
			"SHOULD return $expected WHEN Math.random gives $random",
			({ random, expected }) => {
				vi.spyOn(Math, "random").mockReturnValue(random);

				expect(randomBetween(10, 20)).toBeCloseTo(expected);
			},
		);
	});
});

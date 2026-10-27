import { describe, expect, it } from "vitest";

import { interpolate } from "./interpolate.ts";

describe("interpolate.ts", () => {
	describe("ratio", () => {
		it.each([
			{ ratio: 0, expected: 10 },
			{ ratio: 0.25, expected: 15 },
			{ ratio: 1, expected: 30 },
		])(
			"SHOULD return $expected WHEN the ratio is $ratio",
			({ ratio, expected }) => {
				expect(interpolate(10, 30, ratio)).toBe(expected);
			},
		);

		it("SHOULD extrapolate WHEN the ratio is outside 0 and 1", () => {
			expect(interpolate(10, 30, 1.5)).toBe(40);
		});

		it("SHOULD go down WHEN the target is below the start", () => {
			expect(interpolate(30, 10, 0.5)).toBe(20);
		});
	});
});

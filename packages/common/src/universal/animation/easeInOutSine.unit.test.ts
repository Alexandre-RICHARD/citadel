import { describe, expect, it } from "vitest";

import { easeInOutSine } from "./easeInOutSine.ts";

describe("easeInOutSine.ts", () => {
	describe("key points", () => {
		it.each([
			{ progress: 0, expected: 0 },
			{ progress: 0.5, expected: 0.5 },
			{ progress: 1, expected: 1 },
		])(
			"SHOULD return $expected WHEN progress is $progress",
			({ progress, expected }) => {
				expect(easeInOutSine(progress)).toBeCloseTo(expected);
			},
		);

		it("SHOULD move slowly WHEN the animation starts", () => {
			expect(easeInOutSine(0.1)).toBeLessThan(0.1);
		});
	});

	describe("out of range", () => {
		it.each([
			{ progress: -0.5, expected: 0 },
			{ progress: 1.5, expected: 1 },
		])(
			"SHOULD return $expected WHEN progress is $progress",
			({ progress, expected }) => {
				expect(easeInOutSine(progress)).toBe(expected);
			},
		);
	});
});

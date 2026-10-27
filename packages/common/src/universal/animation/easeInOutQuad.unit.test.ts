import { describe, expect, it } from "vitest";

import { easeInOutQuad } from "./easeInOutQuad.ts";

describe("easeInOutQuad.ts", () => {
	describe("key points", () => {
		it.each([
			{ progress: 0, expected: 0 },
			{ progress: 0.25, expected: 0.125 },
			{ progress: 0.5, expected: 0.5 },
			{ progress: 0.75, expected: 0.875 },
			{ progress: 1, expected: 1 },
		])(
			"SHOULD return $expected WHEN progress is $progress",
			({ progress, expected }) => {
				expect(easeInOutQuad(progress)).toBeCloseTo(expected);
			},
		);
	});
});

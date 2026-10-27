import { describe, expect, it } from "vitest";

import { mixRgb } from "./mixRgb.ts";

describe("mixRgb.ts", () => {
	describe("ratio", () => {
		it.each([
			{ ratio: 0, expected: [0, 100, 255] },
			{ ratio: 0.5, expected: [50, 75, 127.5] },
			{ ratio: 1, expected: [100, 50, 0] },
		])(
			"SHOULD return $expected WHEN the ratio is $ratio",
			({ ratio, expected }) => {
				expect(mixRgb([0, 100, 255], [100, 50, 0], ratio)).toStrictEqual(
					expected,
				);
			},
		);
	});
});

import { describe, expect, it } from "vitest";

import { getFamily } from "./getFamily.ts";

describe("getFamily.ts", () => {
	describe("series numbers", () => {
		it.each([
			{ seriesNumber: 3, expected: 3 },
			{ seriesNumber: 3.1, expected: 3 },
			{ seriesNumber: 3.999, expected: 3 },
			{ seriesNumber: 7.001, expected: 7 },
		])(
			"SHOULD return $expected WHEN the number is $seriesNumber",
			({ seriesNumber, expected }) => {
				expect(getFamily(seriesNumber)).toBe(expected);
			},
		);

		it("SHOULD ignore floating point errors WHEN the number comes from a computation", () => {
			expect(getFamily(0.1 + 2.9)).toBe(3);
		});
	});
});

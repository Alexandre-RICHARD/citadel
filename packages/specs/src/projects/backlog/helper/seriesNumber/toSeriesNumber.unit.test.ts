import { describe, expect, it } from "vitest";

import { toSeriesNumber } from "./toSeriesNumber.ts";

describe("toSeriesNumber.ts", () => {
	describe("family and rank", () => {
		it.each([
			{ family: 3, subPart: 0, expected: 3 },
			{ family: 3, subPart: 100, expected: 3.1 },
			{ family: 3, subPart: 10, expected: 3.01 },
			{ family: 12, subPart: 155, expected: 12.155 },
		])(
			"SHOULD return $expected WHEN the family is $family and the rank $subPart",
			({ family, subPart, expected }) => {
				expect(toSeriesNumber(family, subPart)).toBe(expected);
			},
		);
	});
});

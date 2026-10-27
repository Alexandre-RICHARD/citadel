import { describe, expect, it } from "vitest";

import { getSubPart } from "./getSubPart.ts";

describe("getSubPart.ts", () => {
	describe("series numbers", () => {
		it.each([
			{ seriesNumber: 3, expected: 0 },
			{ seriesNumber: 3.1, expected: 100 },
			{ seriesNumber: 3.01, expected: 10 },
			{ seriesNumber: 3.001, expected: 1 },
			{ seriesNumber: 3.15, expected: 150 },
		])(
			"SHOULD return $expected thousandths WHEN the number is $seriesNumber",
			({ seriesNumber, expected }) => {
				expect(getSubPart(seriesNumber)).toBe(expected);
			},
		);

		it("SHOULD ignore floating point errors WHEN the number comes from a computation", () => {
			expect(getSubPart(2.1 + 0.2)).toBe(300);
		});
	});
});

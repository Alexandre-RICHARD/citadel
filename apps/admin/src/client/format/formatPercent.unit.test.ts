import { describe, expect, it } from "vitest";

import { formatPercent } from "./formatPercent";

describe("formatPercent.ts", () => {
	describe("measured value", () => {
		it.each([
			{ value: 12.4, expected: "12 %" },
			{ value: 99.6, expected: "100 %" },
			{ value: 0, expected: "0 %" },
		])(
			"SHOULD write $expected WHEN the value is $value",
			({ value, expected }) => {
				expect(formatPercent(value)).toBe(expected);
			},
		);
	});

	describe("missing value", () => {
		it("SHOULD write a dash WHEN nothing is measured yet", () => {
			expect(formatPercent(null)).toBe("–");
		});
	});
});

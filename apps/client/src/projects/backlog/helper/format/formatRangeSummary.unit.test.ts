import { describe, expect, it } from "vitest";

import { formatRangeSummary } from "./formatRangeSummary";

describe("formatRangeSummary.ts", () => {
	describe("bounds", () => {
		it.each([
			{ min: "10", max: "20", expected: "10 – 20" },
			{ min: "10", max: null, expected: "≥ 10" },
			{ min: null, max: "20", expected: "≤ 20" },
		])(
			"SHOULD write $expected WHEN the bounds are $min and $max",
			({ min, max, expected }) => {
				expect(formatRangeSummary(min, max)).toBe(expected);
			},
		);

		it("SHOULD return null WHEN there is no bound", () => {
			expect(formatRangeSummary(null, null)).toBeNull();
		});
	});
});

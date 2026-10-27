import { describe, expect, it } from "vitest";

import { getSubPartStep } from "./getSubPartStep.ts";

describe("getSubPartStep.ts", () => {
	describe("family digits", () => {
		it.each([
			{ digits: 1, expected: 100 },
			{ digits: 2, expected: 10 },
			{ digits: 3, expected: 1 },
		])(
			"SHOULD step by $expected thousandths WHEN the family has $digits digits",
			({ digits, expected }) => {
				expect(getSubPartStep(digits)).toBe(expected);
			},
		);
	});
});

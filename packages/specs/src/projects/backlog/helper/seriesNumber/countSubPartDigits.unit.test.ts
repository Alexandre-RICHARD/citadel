import { describe, expect, it } from "vitest";

import { countSubPartDigits } from "./countSubPartDigits.ts";

describe("countSubPartDigits.ts", () => {
	describe("ranks in thousandths", () => {
		it.each([
			{ subPart: 100, number: "3.1", expected: 1 },
			{ subPart: 900, number: "3.9", expected: 1 },
			{ subPart: 10, number: "3.01", expected: 2 },
			{ subPart: 150, number: "3.15", expected: 2 },
			{ subPart: 1, number: "3.001", expected: 3 },
			{ subPart: 155, number: "3.155", expected: 3 },
		])(
			"SHOULD need $expected digits WHEN the number is $number",
			({ subPart, expected }) => {
				expect(countSubPartDigits(subPart)).toBe(expected);
			},
		);
	});
});

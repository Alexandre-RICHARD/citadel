import { describe, expect, it } from "vitest";

import { parseSeriesNumber } from "./parseSeriesNumber.ts";

const TWO_DIGIT_FAMILY = [
	{ gameId: 1, seriesNumber: 3 },
	{ gameId: 2, seriesNumber: 3.01 },
	{ gameId: 3, seriesNumber: 3.1 },
];

describe("parseSeriesNumber.ts", () => {
	describe("accepted inputs", () => {
		it.each([
			{ reason: "an integer", text: "3", expected: 3 },
			{ reason: "a sub-game with a dot", text: "3.5", expected: 3.5 },
			{ reason: "a sub-game with a comma", text: "3,5", expected: 3.5 },
			{ reason: "surrounded by spaces", text: " 7 ", expected: 7 },
			{ reason: "with zero decimals", text: "4.0", expected: 4 },
		])("SHOULD read the number WHEN it is $reason", ({ text, expected }) => {
			expect(parseSeriesNumber(text, [])).toBe(expected);
		});

		it("SHOULD read a rank of the family WHEN it has fewer decimals than its family", () => {
			expect(parseSeriesNumber("3.1", TWO_DIGIT_FAMILY)).toBe(3.01);
		});

		it("SHOULD keep the value WHEN it has more decimals than its family", () => {
			expect(
				parseSeriesNumber("3.15", [
					{ gameId: 1, seriesNumber: 3.1 },
					{ gameId: 2, seriesNumber: 3.2 },
				]),
			).toBe(3.15);
		});
	});

	describe("rejected inputs", () => {
		it.each([
			{ reason: "zero", text: "0" },
			{ reason: "negative", text: "-2" },
			{ reason: "with four decimals", text: "3.1234" },
			{ reason: "not a number", text: "trois" },
			{ reason: "empty", text: "" },
		])("SHOULD refuse the number WHEN it is $reason", ({ text }) => {
			expect(parseSeriesNumber(text, [])).toBeNull();
		});
	});
});

import { describe, expect, it } from "vitest";

import { formatNumberWithSpaces } from "./formatNumberWithSpaces.ts";

describe("formatNumberWithSpaces.ts", () => {
	describe("thousands separator", () => {
		it("SHOULD separate the thousands with a regular space", () => {
			expect(formatNumberWithSpaces(1234567)).toBe("1 234 567");
		});

		it("SHOULD not add a separator WHEN the number is below 1000", () => {
			expect(formatNumberWithSpaces(999)).toBe("999");
		});

		it("SHOULD keep the minus sign and use a comma for the decimals", () => {
			expect(formatNumberWithSpaces(-1234.5)).toBe("-1 234,5");
		});

		it("SHOULD round to 3 decimals", () => {
			expect(formatNumberWithSpaces(0.123456)).toBe("0,123");
		});
	});
});

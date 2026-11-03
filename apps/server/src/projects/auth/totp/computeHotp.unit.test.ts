import { describe, expect, it } from "vitest";

import { computeHotp } from "./computeHotp.ts";

const RFC_SECRET = Buffer.from("12345678901234567890", "ascii");

describe("computeHotp.ts", () => {
	describe("test vectors", () => {
		// RFC 4226, annexe D
		it.each([
			{ counter: 0, expected: "755224" },
			{ counter: 1, expected: "287082" },
			{ counter: 2, expected: "359152" },
			{ counter: 3, expected: "969429" },
			{ counter: 4, expected: "338314" },
			{ counter: 5, expected: "254676" },
			{ counter: 6, expected: "287922" },
			{ counter: 7, expected: "162583" },
			{ counter: 8, expected: "399871" },
			{ counter: 9, expected: "520489" },
		])(
			"SHOULD give $expected WHEN the counter is $counter",
			({ counter, expected }) => {
				expect(computeHotp(RFC_SECRET, counter, 6)).toBe(expected);
			},
		);
	});

	describe("digits", () => {
		it("SHOULD keep the leading zeros WHEN the code is shorter than the digits asked", () => {
			// RFC 6238, annexe B : 07081804 à 1111111109 s, donc au pas 37037036
			expect(computeHotp(RFC_SECRET, 37_037_036, 8)).toBe("07081804");
		});
	});
});

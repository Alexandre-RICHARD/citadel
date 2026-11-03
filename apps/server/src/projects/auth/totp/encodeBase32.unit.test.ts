import { describe, expect, it } from "vitest";

import { encodeBase32 } from "./encodeBase32.ts";

describe("encodeBase32.ts", () => {
	describe("test vectors", () => {
		// RFC 4648, §10, sans le remplissage
		it.each([
			{ input: "", expected: "" },
			{ input: "f", expected: "MY" },
			{ input: "fo", expected: "MZXQ" },
			{ input: "foo", expected: "MZXW6" },
			{ input: "foob", expected: "MZXW6YQ" },
			{ input: "fooba", expected: "MZXW6YTB" },
			{ input: "foobar", expected: "MZXW6YTBOI" },
		])(
			"SHOULD give $expected WHEN encoding '$input'",
			({ input, expected }) => {
				expect(encodeBase32(Buffer.from(input, "ascii"))).toBe(expected);
			},
		);
	});

	describe("output", () => {
		it("SHOULD give 32 characters of the RFC alphabet WHEN encoding a 20-byte TOTP secret", () => {
			expect(encodeBase32(Buffer.alloc(20, 0xff))).toMatch(/^[A-Z2-7]{32}$/u);
		});

		it("SHOULD encode the RFC 6238 seed as the applications know it", () => {
			expect(encodeBase32(Buffer.from("12345678901234567890", "ascii"))).toBe(
				"GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ",
			);
		});
	});
});

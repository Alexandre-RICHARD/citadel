import { describe, expect, it } from "vitest";

import { createRandomToken } from "./createRandomToken.ts";

const BASE64URL = /^[A-Za-z0-9_-]+$/;
const HEX = /^[0-9a-f]+$/;

describe("createRandomToken.ts", () => {
	describe("format", () => {
		it("SHOULD give 32 bytes in base64url WHEN called without options", () => {
			// Act
			const token = createRandomToken();

			// Assert
			expect(token).toMatch(BASE64URL);
			expect(Buffer.from(token, "base64url")).toHaveLength(32);
		});

		it("SHOULD give the requested bytes in hex WHEN asked for hex", () => {
			// Act
			const token = createRandomToken(4, "hex");

			// Assert
			expect(token).toMatch(HEX);
			expect(token).toHaveLength(8);
		});
	});

	describe("randomness", () => {
		it("SHOULD never give the same token twice WHEN called many times", () => {
			// Act
			const tokens = new Set(
				Array.from({ length: 1000 }, () => createRandomToken()),
			);

			// Assert
			expect(tokens.size).toBe(1000);
		});
	});
});

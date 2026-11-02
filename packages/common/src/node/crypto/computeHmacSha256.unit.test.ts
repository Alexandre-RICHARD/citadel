import { describe, expect, it } from "vitest";

import { computeHmacSha256 } from "./computeHmacSha256.ts";

describe("computeHmacSha256.ts", () => {
	describe("digest", () => {
		it("SHOULD give the standard HMAC-SHA-256 WHEN computing a test vector", () => {
			// Act
			const digest = computeHmacSha256("Jefe", "what do ya want for nothing?");

			// Assert : cas de test 2 de la RFC 4231
			expect(digest.toString("hex")).toBe(
				"5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843",
			);
		});

		it("SHOULD give another digest WHEN the key differs", () => {
			expect(computeHmacSha256("clé 1", "123456")).not.toStrictEqual(
				computeHmacSha256("clé 2", "123456"),
			);
		});
	});
});

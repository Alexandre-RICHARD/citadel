import { describe, expect, it } from "vitest";

import { hashSha256 } from "./hashSha256.ts";

describe("hashSha256.ts", () => {
	describe("digest", () => {
		it("SHOULD give the standard SHA-256 digest WHEN hashing a test vector", () => {
			// Act
			const digest = hashSha256("abc");

			// Assert : vecteur de la FIPS 180-2
			expect(digest.toString("hex")).toBe(
				"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
			);
		});

		it("SHOULD give 32 bytes WHEN hashing a token", () => {
			expect(hashSha256("un jeton")).toHaveLength(32);
		});

		it("SHOULD hash the UTF-8 bytes WHEN the value has accents", () => {
			expect(hashSha256("é")).toStrictEqual(hashSha256("é"));
			expect(hashSha256("é")).not.toStrictEqual(hashSha256("é"));
		});
	});
});

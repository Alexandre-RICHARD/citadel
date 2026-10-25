import { describe, expect, it } from "vitest";

import { hashPassword } from "./hashPassword.ts";
import { verifyPassword } from "./verifyPassword.ts";

describe("verifyPassword.ts", () => {
	describe("password check", () => {
		it("SHOULD accept the password WHEN it is the hashed one", () => {
			expect(
				verifyPassword("un mot de passe", hashPassword("un mot de passe")),
			).toBe(true);
		});

		it("SHOULD refuse the password WHEN it differs", () => {
			expect(verifyPassword("un autre", hashPassword("un mot de passe"))).toBe(
				false,
			);
		});

		it("SHOULD refuse any password WHEN the stored hash is malformed", () => {
			expect(verifyPassword("", "pas-un-hachage")).toBe(false);
		});
	});

	describe("hash format", () => {
		it("SHOULD produce a hash without any dollar sign WHEN hashing", () => {
			expect(hashPassword("un mot de passe")).not.toContain("$");
		});
	});
});

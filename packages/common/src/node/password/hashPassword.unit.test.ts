import { describe, expect, it } from "vitest";

import { hashPassword } from "./hashPassword.ts";
import { OWASP_ARGON2_PARAMETERS } from "./owaspArgon2Parameters.ts";
import { TEST_ARGON2_PARAMETERS } from "./testArgon2Parameters.ts";
import { verifyPassword } from "./verifyPassword.ts";

const PASSWORD = "une phrase de passe assez longue";

describe("hashPassword.ts", () => {
	describe("format", () => {
		it("SHOULD describe the algorithm and its parameters WHEN hashing", async () => {
			// Act
			const storedHash = await hashPassword(PASSWORD, OWASP_ARGON2_PARAMETERS);

			// Assert
			expect(storedHash).toMatch(
				/^argon2id:m=19456,t=2,p=1:[A-Za-z0-9_-]{22}:[A-Za-z0-9_-]{43}$/,
			);
		});

		it("SHOULD never contain a dollar sign WHEN hashing", async () => {
			expect(
				await hashPassword(PASSWORD, TEST_ARGON2_PARAMETERS),
			).not.toContain("$");
		});

		it("SHOULD give two different hashes WHEN hashing the same password twice", async () => {
			// Act
			const first = await hashPassword(PASSWORD, TEST_ARGON2_PARAMETERS);
			const second = await hashPassword(PASSWORD, TEST_ARGON2_PARAMETERS);

			// Assert
			expect(first).not.toBe(second);
		});
	});

	describe("normalization", () => {
		it("SHOULD accept the composed accent WHEN the password was hashed with a precomposed one", async () => {
			// Arrange
			const storedHash = await hashPassword(
				"mot de passe déjà vu",
				TEST_ARGON2_PARAMETERS,
			);

			// Act
			const isAccepted = await verifyPassword(
				"mot de passe déjà vu",
				storedHash,
			);

			// Assert
			expect(isAccepted).toBe(true);
		});
	});
});

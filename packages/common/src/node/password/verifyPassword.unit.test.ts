import { describe, expect, it } from "vitest";

import { hashPassword } from "./hashPassword.ts";
import { TEST_ARGON2_PARAMETERS } from "./testArgon2Parameters.ts";
import { verifyPassword } from "./verifyPassword.ts";

const PASSWORD = "une phrase de passe assez longue";
// Hash scrypt de l'ancienne console : plus accepté, le hash de la console est à refaire
const SCRYPT_HASH = "scrypt:00112233445566778899aabbccddeeff:0011";

describe("verifyPassword.ts", () => {
	describe("accepted passwords", () => {
		it("SHOULD accept the password WHEN it is the hashed one", async () => {
			// Arrange
			const storedHash = await hashPassword(PASSWORD, TEST_ARGON2_PARAMETERS);

			// Act & Assert
			expect(await verifyPassword(PASSWORD, storedHash)).toBe(true);
		});

		it("SHOULD use the parameters of the stored hash WHEN they differ from the current ones", async () => {
			// Arrange
			const storedHash = await hashPassword(PASSWORD, {
				...TEST_ARGON2_PARAMETERS,
				passes: 3,
			});

			// Act & Assert
			expect(await verifyPassword(PASSWORD, storedHash)).toBe(true);
		});
	});

	describe("refused passwords", () => {
		it("SHOULD refuse the password WHEN it differs", async () => {
			// Arrange
			const storedHash = await hashPassword(PASSWORD, TEST_ARGON2_PARAMETERS);

			// Act & Assert
			expect(await verifyPassword(`${PASSWORD}!`, storedHash)).toBe(false);
		});

		it("SHOULD refuse the password WHEN the case differs", async () => {
			// Arrange
			const storedHash = await hashPassword(PASSWORD, TEST_ARGON2_PARAMETERS);

			// Act & Assert
			expect(await verifyPassword(PASSWORD.toUpperCase(), storedHash)).toBe(
				false,
			);
		});

		it.each([
			{ storedHash: SCRYPT_HASH, reason: "an old scrypt hash" },
			{ storedHash: "", reason: "empty" },
			{
				storedHash: "argon2id:m=19456,t=2,p=1:abc",
				reason: "missing its digest",
			},
			{
				storedHash: "argon2id:m=19456,t=2:abc:def",
				reason: "missing a parameter",
			},
			{
				storedHash: "argon2id:m=4,t=1,p=1:abc:def",
				reason: "asking for less memory than argon2 accepts",
			},
			{
				storedHash: "argon2id:m=19456,t=0,p=1:abc:def",
				reason: "asking for no pass",
			},
			{
				storedHash: "argon2id:m=19456,t=2,p=0:abc:def",
				reason: "asking for no thread",
			},
			{
				storedHash: "argon2id:m=19456,t=2,p=1:a$c:def",
				reason: "holding a dollar sign",
			},
			{
				storedHash: "argon2id:m=19456,t=2,p=1:abc:def:ghi",
				reason: "holding an extra part",
			},
		])(
			"SHOULD refuse any password WHEN the stored hash is $reason",
			async ({ storedHash }) => {
				expect(await verifyPassword(PASSWORD, storedHash)).toBe(false);
			},
		);
	});
});

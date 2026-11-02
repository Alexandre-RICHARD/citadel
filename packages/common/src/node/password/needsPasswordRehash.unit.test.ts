import { describe, expect, it } from "vitest";

import { hashPassword } from "./hashPassword.ts";
import { needsPasswordRehash } from "./needsPasswordRehash.ts";
import { TEST_ARGON2_PARAMETERS } from "./testArgon2Parameters.ts";

const PASSWORD = "une phrase de passe assez longue";

describe("needsPasswordRehash.ts", () => {
	describe("current hashes", () => {
		it("SHOULD answer false WHEN the hash has the current parameters", async () => {
			// Arrange
			const storedHash = await hashPassword(PASSWORD, TEST_ARGON2_PARAMETERS);

			// Act & Assert
			expect(needsPasswordRehash(storedHash, TEST_ARGON2_PARAMETERS)).toBe(
				false,
			);
		});
	});

	describe("outdated hashes", () => {
		it.each([
			{ parameter: "memoryKib", value: 128 },
			{ parameter: "passes", value: 2 },
			{ parameter: "parallelism", value: 2 },
		])(
			"SHOULD answer true WHEN $parameter went up",
			async ({ parameter, value }) => {
				// Arrange
				const storedHash = await hashPassword(PASSWORD, TEST_ARGON2_PARAMETERS);

				// Act
				const needsRehash = needsPasswordRehash(storedHash, {
					...TEST_ARGON2_PARAMETERS,
					[parameter]: value,
				});

				// Assert
				expect(needsRehash).toBe(true);
			},
		);

		it("SHOULD answer true WHEN the hash is not an argon2id hash", () => {
			expect(
				needsPasswordRehash("scrypt:0011:2233", TEST_ARGON2_PARAMETERS),
			).toBe(true);
		});
	});
});

import { describe, expect, it } from "vitest";

import { createSecretCipher } from "./createSecretCipher.ts";

const KEY_V1 = "11".repeat(32);
const KEY_V2 = "22".repeat(32);
const SECRET = Buffer.from("JBSWY3DPEHPK3PXP", "utf8");
const FACTOR_ID = 42;

describe("createSecretCipher.ts", () => {
	describe("current key", () => {
		it("SHOULD decrypt with no rewrite needed WHEN the secret uses the current key", () => {
			// Arrange
			const cipher = createSecretCipher({
				currentKey: KEY_V1,
				currentKeyVersion: 1,
				previousKey: null,
			});
			const { encrypted, keyVersion } = cipher.encrypt(SECRET, FACTOR_ID);

			// Act
			const decrypted = cipher.decrypt(encrypted, keyVersion, FACTOR_ID);

			// Assert
			expect(keyVersion).toBe(1);
			expect(decrypted).toStrictEqual({
				plaintext: SECRET,
				needsReencryption: false,
			});
		});

		it("SHOULD refuse the secret WHEN it is read for another factor", () => {
			// Arrange
			const cipher = createSecretCipher({
				currentKey: KEY_V1,
				currentKeyVersion: 1,
				previousKey: null,
			});
			const { encrypted, keyVersion } = cipher.encrypt(SECRET, FACTOR_ID);

			// Act & Assert
			expect(() =>
				cipher.decrypt(encrypted, keyVersion, FACTOR_ID + 1),
			).toThrow();
		});

		it("SHOULD refuse the secret WHEN its key version was changed", () => {
			// Arrange
			const cipher = createSecretCipher({
				currentKey: KEY_V2,
				currentKeyVersion: 2,
				previousKey: KEY_V2,
			});
			const { encrypted } = cipher.encrypt(SECRET, FACTOR_ID);

			// Act & Assert : même clé sous les deux versions, la donnée associée suffit à refuser
			expect(() => cipher.decrypt(encrypted, 1, FACTOR_ID)).toThrow();
		});
	});

	describe("rotation", () => {
		it("SHOULD decrypt and ask for a rewrite WHEN the secret uses the previous key", () => {
			// Arrange
			const before = createSecretCipher({
				currentKey: KEY_V1,
				currentKeyVersion: 1,
				previousKey: null,
			});
			const { encrypted, keyVersion } = before.encrypt(SECRET, FACTOR_ID);
			const after = createSecretCipher({
				currentKey: KEY_V2,
				currentKeyVersion: 2,
				previousKey: KEY_V1,
			});

			// Act
			const decrypted = after.decrypt(encrypted, keyVersion, FACTOR_ID);

			// Assert
			expect(decrypted).toStrictEqual({
				plaintext: SECRET,
				needsReencryption: true,
			});
			expect(after.encrypt(SECRET, FACTOR_ID).keyVersion).toBe(2);
		});

		it("SHOULD throw WHEN no key exists for the version of the secret", () => {
			// Arrange
			const before = createSecretCipher({
				currentKey: KEY_V1,
				currentKeyVersion: 1,
				previousKey: null,
			});
			const { encrypted } = before.encrypt(SECRET, FACTOR_ID);
			const after = createSecretCipher({
				currentKey: KEY_V2,
				currentKeyVersion: 2,
				previousKey: null,
			});

			// Act & Assert
			expect(() => after.decrypt(encrypted, 1, FACTOR_ID)).toThrow(
				"No encryption key for version 1",
			);
		});
	});
});

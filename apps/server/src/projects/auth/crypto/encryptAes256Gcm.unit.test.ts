import { describe, expect, it } from "vitest";

import { decryptAes256Gcm } from "./decryptAes256Gcm.ts";
import { encryptAes256Gcm } from "./encryptAes256Gcm.ts";

const KEY = Buffer.alloc(32, 7);
const SECRET = Buffer.from("JBSWY3DPEHPK3PXP", "utf8");
const ASSOCIATED_DATA = Buffer.from("1:42", "utf8");

describe("encryptAes256Gcm.ts", () => {
	describe("output", () => {
		it("SHOULD give an IV, the ciphertext and a tag WHEN encrypting", () => {
			// Act
			const encrypted = encryptAes256Gcm(KEY, SECRET, ASSOCIATED_DATA);

			// Assert
			expect(encrypted).toHaveLength(12 + SECRET.length + 16);
			expect(encrypted.includes(SECRET)).toBe(false);
		});

		it("SHOULD give two different outputs WHEN encrypting the same secret twice", () => {
			// Act
			const first = encryptAes256Gcm(KEY, SECRET, ASSOCIATED_DATA);
			const second = encryptAes256Gcm(KEY, SECRET, ASSOCIATED_DATA);

			// Assert : un IV neuf à chaque fois
			expect(first.subarray(0, 12)).not.toStrictEqual(second.subarray(0, 12));
		});

		it("SHOULD be readable back WHEN decrypted with the same key and data", () => {
			// Arrange
			const encrypted = encryptAes256Gcm(KEY, SECRET, ASSOCIATED_DATA);

			// Act & Assert
			expect(decryptAes256Gcm(KEY, encrypted, ASSOCIATED_DATA)).toStrictEqual(
				SECRET,
			);
		});
	});
});

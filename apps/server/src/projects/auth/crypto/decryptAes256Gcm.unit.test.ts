import { describe, expect, it } from "vitest";

import { decryptAes256Gcm } from "./decryptAes256Gcm.ts";
import { encryptAes256Gcm } from "./encryptAes256Gcm.ts";

const KEY = Buffer.alloc(32, 7);
const SECRET = Buffer.from("JBSWY3DPEHPK3PXP", "utf8");
const ASSOCIATED_DATA = Buffer.from("1:42", "utf8");

function flipByte(buffer: Buffer, index: number): Buffer {
	const copy = Buffer.from(buffer);
	copy.writeUInt8((copy.readUInt8(index) + 1) % 256, index);
	return copy;
}

describe("decryptAes256Gcm.ts", () => {
	describe("refused values", () => {
		it.each([
			{ index: 0, reason: "the IV" },
			{ index: 14, reason: "the ciphertext" },
			{ index: 12 + SECRET.length + 3, reason: "the tag" },
		])("SHOULD throw WHEN a byte of $reason changed", ({ index }) => {
			// Arrange
			const encrypted = flipByte(
				encryptAes256Gcm(KEY, SECRET, ASSOCIATED_DATA),
				index,
			);

			// Act & Assert
			expect(() => decryptAes256Gcm(KEY, encrypted, ASSOCIATED_DATA)).toThrow();
		});

		it("SHOULD throw WHEN the associated data differs", () => {
			// Arrange
			const encrypted = encryptAes256Gcm(KEY, SECRET, ASSOCIATED_DATA);

			// Act & Assert
			expect(() =>
				decryptAes256Gcm(KEY, encrypted, Buffer.from("1:43", "utf8")),
			).toThrow();
		});

		it("SHOULD throw WHEN the key differs", () => {
			// Arrange
			const encrypted = encryptAes256Gcm(KEY, SECRET, ASSOCIATED_DATA);

			// Act & Assert
			expect(() =>
				decryptAes256Gcm(Buffer.alloc(32, 8), encrypted, ASSOCIATED_DATA),
			).toThrow();
		});

		it("SHOULD throw WHEN the value is shorter than an IV and a tag", () => {
			expect(() =>
				decryptAes256Gcm(KEY, Buffer.alloc(27), ASSOCIATED_DATA),
			).toThrow("Encrypted value too short");
		});
	});
});

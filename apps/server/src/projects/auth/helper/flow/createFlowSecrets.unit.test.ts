import { computeHmacSha256 } from "@citadel/common/src/node/crypto/computeHmacSha256.ts";
import { hashSha256 } from "@citadel/common/src/node/crypto/hashSha256.ts";
import { describe, expect, it } from "vitest";

import { createFlowSecrets } from "./createFlowSecrets.ts";

const HMAC_KEY = "c".repeat(64);

describe("createFlowSecrets.ts", () => {
	describe("code", () => {
		it("SHOULD give 6 digits, leading zeros kept, WHEN drawn many times", () => {
			// Act
			const codes = Array.from(
				{ length: 200 },
				() => createFlowSecrets(HMAC_KEY).code,
			);

			// Assert
			expect(codes.every((code) => /^\d{6}$/u.test(code))).toBe(true);
		});

		it("SHOULD keep only the HMAC of the code with the given key", () => {
			// Act
			const secrets = createFlowSecrets(HMAC_KEY);

			// Assert
			expect(secrets.codeHmac).toStrictEqual(
				computeHmacSha256(HMAC_KEY, secrets.code),
			);
		});
	});

	describe("link", () => {
		it("SHOULD give a 32-byte base64url token and its SHA-256", () => {
			// Act
			const secrets = createFlowSecrets(HMAC_KEY);

			// Assert
			expect(Buffer.from(secrets.linkToken, "base64url")).toHaveLength(32);
			expect(secrets.linkTokenHash).toStrictEqual(
				hashSha256(secrets.linkToken),
			);
		});

		it("SHOULD never give the same link twice", () => {
			expect(createFlowSecrets(HMAC_KEY).linkToken).not.toBe(
				createFlowSecrets(HMAC_KEY).linkToken,
			);
		});
	});
});

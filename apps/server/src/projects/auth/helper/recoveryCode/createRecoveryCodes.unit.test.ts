import { recoveryCodeSchema } from "@citadel/specs/src/projects/auth/schema/recoveryCodeSchema.ts";
import { describe, expect, it } from "vitest";

import { createRecoveryCodes } from "./createRecoveryCodes.ts";
import { hashRecoveryCode } from "./hashRecoveryCode.ts";

const HMAC_KEY = "clé des codes";

describe("createRecoveryCodes.ts", () => {
	describe("codes", () => {
		it("SHOULD give the asked number of different codes, in two groups of 5 Base32 characters", () => {
			// Act
			const { codes } = createRecoveryCodes(10, HMAC_KEY);

			// Assert
			expect(codes).toHaveLength(10);
			expect(new Set(codes).size).toBe(10);
			for (const code of codes)
				expect(code).toMatch(/^[A-Z2-7]{5}-[A-Z2-7]{5}$/u);
		});

		it("SHOULD give other codes WHEN called again", () => {
			expect(createRecoveryCodes(10, HMAC_KEY).codes).not.toStrictEqual(
				createRecoveryCodes(10, HMAC_KEY).codes,
			);
		});
	});

	describe("hashes", () => {
		it("SHOULD give each code the hash of the code as typed WHEN its schema cleans it", () => {
			// Act
			const { codes, codeHashes } = createRecoveryCodes(3, HMAC_KEY);

			// Assert
			expect(codeHashes).toStrictEqual(
				codes.map((code) =>
					hashRecoveryCode(
						HMAC_KEY,
						recoveryCodeSchema.parse(code.toLowerCase()),
					),
				),
			);
		});
	});
});

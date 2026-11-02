import { describe, expect, it } from "vitest";

import { checkPasswordLength } from "./checkPasswordLength";

describe("checkPasswordLength.ts", () => {
	describe("minimum", () => {
		it.each([
			{ length: 11, hasMinLength: false },
			{ length: 12, hasMinLength: true },
		])(
			"SHOULD say $hasMinLength WHEN the password has $length characters",
			({ length, hasMinLength }) => {
				expect(checkPasswordLength("a".repeat(length)).hasMinLength).toBe(
					hasMinLength,
				);
			},
		);

		it("SHOULD count an accent typed in two keys as one character", () => {
			expect(checkPasswordLength(`${"a".repeat(10)}é`).hasMinLength).toBe(
				false,
			);
		});
	});

	describe("maximum", () => {
		it.each([
			{ length: 128, hasMaxLength: true },
			{ length: 129, hasMaxLength: false },
		])(
			"SHOULD say $hasMaxLength WHEN the password has $length characters",
			({ length, hasMaxLength }) => {
				expect(checkPasswordLength("a".repeat(length)).hasMaxLength).toBe(
					hasMaxLength,
				);
			},
		);

		it("SHOULD count each emoji as one character", () => {
			expect(checkPasswordLength("🔑".repeat(128)).hasMaxLength).toBe(true);
		});
	});
});

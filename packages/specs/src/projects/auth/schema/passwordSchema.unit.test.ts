import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { passwordSchema } from "./passwordSchema.ts";

describe("passwordSchema.ts", () => {
	describe("accepted passwords", () => {
		it.each([
			{ reason: "12 characters", value: "a".repeat(12) },
			{ reason: "128 characters", value: "a".repeat(128) },
			{ reason: "spaces at both ends", value: "  mon secret  " },
			{ reason: "12 emojis", value: "🔑".repeat(12) },
		])("SHOULD keep $reason untouched", ({ value }) => {
			expect(passwordSchema.parse(value)).toBe(value);
		});

		it("SHOULD compose an accent typed in two keys, counted as one character", () => {
			// Arrange : 11 lettres et un « e » suivi de son accent, 13 points de code avant NFC
			const value = `${"a".repeat(11)}é`;

			// Act
			const password = passwordSchema.parse(value);

			// Assert
			expect(password).toBe(`${"a".repeat(11)}é`);
		});
	});

	describe("refused passwords", () => {
		it.each([
			{
				reason: "11 characters",
				value: "a".repeat(11),
				rule: { code: ValidationIssueCodeEnum.TOO_SHORT, limit: 12 },
			},
			{
				reason: "129 characters",
				value: "a".repeat(129),
				rule: { code: ValidationIssueCodeEnum.TOO_LONG, limit: 128 },
			},
			{
				reason: "129 accents typed in two keys",
				value: "é".repeat(129),
				rule: { code: ValidationIssueCodeEnum.TOO_LONG, limit: 128 },
			},
		])("SHOULD refuse $reason", ({ value, rule }) => {
			expect(getIssues(passwordSchema.safeParse(value))).toMatchObject([rule]);
		});
	});
});

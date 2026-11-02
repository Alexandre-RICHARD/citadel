import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { emailSchema } from "./emailSchema.ts";

describe("emailSchema.ts", () => {
	describe("accepted emails", () => {
		it.each([
			{ reason: "its case", value: "Alex@Example.com" },
			{ reason: "its accents", value: "josé@exemple.fr" },
		])("SHOULD keep the address as typed, with $reason", ({ value }) => {
			expect(emailSchema.parse(value)).toBe(value);
		});

		it("SHOULD remove the spaces around the address", () => {
			expect(emailSchema.parse("  alex@example.com ")).toBe("alex@example.com");
		});

		it("SHOULD accept an address WHEN it has 254 characters", () => {
			const value = `${"a".repeat(64)}@${"b".repeat(185)}.com`;

			expect(emailSchema.parse(value)).toBe(value);
		});
	});

	describe("refused emails", () => {
		it.each([
			{
				reason: "a full-width letter",
				value: "ａlex@example.com",
				code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
			},
			{
				reason: "a ligature",
				value: "ﬁlou@example.com",
				code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
			},
			{
				reason: "a zero-width space",
				value: "alex​@example.com",
				code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
			},
			{
				reason: "a space inside",
				value: "alex b@example.com",
				code: ValidationIssueCodeEnum.INVALID_FORMAT,
			},
			{
				reason: "a username",
				value: "Alex",
				code: ValidationIssueCodeEnum.INVALID_FORMAT,
			},
			{
				reason: "255 characters",
				value: `${"a".repeat(64)}@${"b".repeat(186)}.com`,
				code: ValidationIssueCodeEnum.TOO_LONG,
			},
		])("SHOULD refuse $reason", ({ value, code }) => {
			expect(getIssues(emailSchema.safeParse(value))).toMatchObject([{ code }]);
		});
	});
});

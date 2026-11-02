import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { usernameSchema } from "./usernameSchema.ts";

describe("usernameSchema.ts", () => {
	describe("accepted usernames", () => {
		it.each([
			{ reason: "letters of both cases", value: "Alex" },
			{ reason: "digits, underscores and dashes", value: "alex_42-b" },
			{ reason: "a single character", value: "a" },
			{ reason: "64 characters", value: "a".repeat(64) },
		])("SHOULD keep $reason untouched", ({ value }) => {
			expect(usernameSchema.parse(value)).toBe(value);
		});
	});

	describe("refused usernames", () => {
		it.each([
			{
				reason: "an empty username",
				value: "",
				code: ValidationIssueCodeEnum.TOO_SHORT,
			},
			{
				reason: "65 characters",
				value: "a".repeat(65),
				code: ValidationIssueCodeEnum.TOO_LONG,
			},
			{
				reason: "a space",
				value: "Alex B",
				code: ValidationIssueCodeEnum.INVALID_FORMAT,
			},
			{
				reason: "an accent",
				value: "Élodie",
				code: ValidationIssueCodeEnum.INVALID_FORMAT,
			},
			{
				reason: "a dot",
				value: "alex.b",
				code: ValidationIssueCodeEnum.INVALID_FORMAT,
			},
			{
				reason: "an at sign",
				value: "alex@b",
				code: ValidationIssueCodeEnum.INVALID_FORMAT,
			},
			{
				reason: "a number",
				value: 42,
				code: ValidationIssueCodeEnum.INVALID_TYPE,
			},
		])("SHOULD refuse $reason", ({ value, code }) => {
			expect(getIssues(usernameSchema.safeParse(value))).toMatchObject([
				{ code },
			]);
		});
	});
});

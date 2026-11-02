import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { displayNameSchema } from "./displayNameSchema.ts";

describe("displayNameSchema.ts", () => {
	describe("accepted display names", () => {
		it.each([
			{ reason: "accents and spaces", value: "Élodie la Grande" },
			{ reason: "symbols and emojis", value: "Alex ★ ❤️" },
			{ reason: "64 characters", value: "é".repeat(64) },
			{ reason: "64 emojis", value: "🎮".repeat(64) },
		])("SHOULD keep $reason", ({ value }) => {
			expect(displayNameSchema.parse(value)).toBe(value);
		});

		it("SHOULD clean the spaces WHEN some are at the ends or doubled", () => {
			expect(displayNameSchema.parse("  Alex   le Grand ")).toBe(
				"Alex le Grand",
			);
		});

		it.each([
			{ reason: "empty", value: "" },
			{ reason: "only spaces", value: "   " },
		])("SHOULD give null WHEN the display name is $reason", ({ value }) => {
			expect(displayNameSchema.parse(value)).toBeNull();
		});
	});

	describe("refused display names", () => {
		it.each([
			{
				reason: "65 characters",
				value: "a".repeat(65),
				code: ValidationIssueCodeEnum.TOO_LONG,
			},
			{
				reason: "a zero-width space",
				value: "Al​ex",
				code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
			},
			{
				reason: "a right-to-left override",
				value: "Alex‮",
				code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
			},
			{
				reason: "a lone half of an emoji",
				value: "Alex\uD83C",
				code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
			},
		])("SHOULD refuse $reason", ({ value, code }) => {
			expect(getIssues(displayNameSchema.safeParse(value))).toMatchObject([
				{ code },
			]);
		});
	});
});

import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { factorNameSchema } from "./factorNameSchema.ts";

describe("factorNameSchema.ts", () => {
	describe("accepted names", () => {
		it.each([
			{ reason: "accents and spaces", value: "Téléphone de Élodie" },
			{ reason: "an emoji", value: "Bitwarden 🔑" },
			{ reason: "50 characters", value: "é".repeat(50) },
		])("SHOULD keep $reason", ({ value }) => {
			expect(factorNameSchema.parse(value)).toBe(value);
		});

		it("SHOULD clean the spaces WHEN some are at the ends or doubled", () => {
			expect(factorNameSchema.parse("  Mon   téléphone ")).toBe(
				"Mon téléphone",
			);
		});
	});

	describe("refused names", () => {
		it.each([
			{
				reason: "an empty name",
				value: "",
				code: ValidationIssueCodeEnum.TOO_SHORT,
			},
			{
				reason: "only spaces",
				value: "   ",
				code: ValidationIssueCodeEnum.TOO_SHORT,
			},
			{
				reason: "51 characters",
				value: "a".repeat(51),
				code: ValidationIssueCodeEnum.TOO_LONG,
			},
			{
				reason: "an invisible character",
				value: "Télé\u200Bphone",
				code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
			},
		])("SHOULD refuse $reason", ({ value, code }) => {
			expect(getIssues(factorNameSchema.safeParse(value))).toMatchObject([
				{ code },
			]);
		});
	});
});

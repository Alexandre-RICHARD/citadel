import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum";
import { describe, expect, it } from "vitest";

import { getValidationIssuePhrase } from "./getValidationIssuePhrase";

describe("getValidationIssuePhrase.ts", () => {
	describe("rules without limit", () => {
		it.each([
			{
				code: ValidationIssueCodeEnum.INVALID_TYPE,
				phrase: "n'a pas le type attendu",
			},
			{
				code: ValidationIssueCodeEnum.INVALID_FORMAT,
				phrase: "n'est pas au format attendu",
			},
			{
				code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
				phrase: "contient des caractères invalides",
			},
			{
				code: ValidationIssueCodeEnum.NOT_INTEGER,
				phrase: "doit être un nombre entier",
			},
			{
				code: ValidationIssueCodeEnum.FUTURE_DATE,
				phrase: "ne peut pas être dans le futur",
			},
			{
				code: ValidationIssueCodeEnum.DATE_TOO_OLD,
				phrase: "ne peut pas précéder l'an 1000",
			},
			{
				code: ValidationIssueCodeEnum.MISSING_FIELDS,
				phrase: "au moins un champ doit être renseigné",
			},
			{
				code: ValidationIssueCodeEnum.INVALID_VALUE,
				phrase: "n'est pas valide",
			},
		])(
			"SHOULD describe the rule WHEN the code is $code",
			({ code, phrase }) => {
				expect(getValidationIssuePhrase({ code })).toBe(phrase);
			},
		);
	});

	describe("rules with a limit", () => {
		it.each([
			{
				code: ValidationIssueCodeEnum.TOO_SHORT,
				limit: 1,
				phrase: "doit contenir au moins 1 caractère",
			},
			{
				code: ValidationIssueCodeEnum.TOO_SHORT,
				limit: 3,
				phrase: "doit contenir au moins 3 caractères",
			},
			{
				code: ValidationIssueCodeEnum.TOO_LONG,
				limit: 255,
				phrase: "doit contenir au plus 255 caractères",
			},
			{
				code: ValidationIssueCodeEnum.TOO_SMALL,
				limit: 1,
				phrase: "doit valoir au moins 1",
			},
			{
				code: ValidationIssueCodeEnum.TOO_BIG,
				limit: 2_147_483_647,
				phrase: "doit valoir au plus 2147483647",
			},
		])(
			"SHOULD include the limit WHEN the code is $code with a limit of $limit",
			({ code, limit, phrase }) => {
				expect(getValidationIssuePhrase({ code, limit })).toBe(phrase);
			},
		);
	});
});

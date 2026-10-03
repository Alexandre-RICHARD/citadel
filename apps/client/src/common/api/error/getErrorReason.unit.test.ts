import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum";
import { describe, expect, it } from "vitest";

import { ApiError } from "./ApiError";
import { getErrorReason } from "./getErrorReason";

const PROJECT_REASONS = { GAME_NOT_FOUND: "ce jeu n'existe plus" };

const NAME_TOO_LONG_ERROR = new ApiError({
	status: 400,
	code: TechnicalErrorCodeEnum.VALIDATION_FAILED,
	issues: [
		{
			path: ["name"],
			code: ValidationIssueCodeEnum.TOO_LONG,
			limit: 255,
			message: "Name should contain at most 255 characters",
		},
	],
});

describe("getErrorReason.ts", () => {
	describe("failures without usable code", () => {
		it.each([
			{
				reason: "no response arrived",
				error: new ApiError({ status: null, code: null }),
				expected: "le serveur est injoignable",
			},
			{
				reason: "a server error has no code",
				error: new ApiError({ status: 502, code: null }),
				expected: "le serveur a rencontré une erreur",
			},
			{
				reason: "a refusal has an unknown code",
				error: new ApiError({ status: 409, code: "NAME_ALREADY_TAKEN" }),
				expected: "la requête a été refusée",
			},
			{
				reason: "the error does not come from the API",
				error: new TypeError("x is undefined"),
				expected: "une erreur inattendue est survenue",
			},
		])("SHOULD give a generic reason WHEN $reason", ({ error, expected }) => {
			expect(getErrorReason(error, { projectReasons: PROJECT_REASONS })).toBe(
				expected,
			);
		});
	});

	describe("translated codes", () => {
		it("SHOULD use the project reason WHEN the code is a business code", () => {
			const error = new ApiError({ status: 404, code: "GAME_NOT_FOUND" });

			expect(getErrorReason(error, { projectReasons: PROJECT_REASONS })).toBe(
				"ce jeu n'existe plus",
			);
		});

		it.each([
			{
				status: 500,
				code: TechnicalErrorCodeEnum.INTERNAL_ERROR,
				expected: "le serveur a rencontré une erreur",
			},
			{
				status: 404,
				code: TechnicalErrorCodeEnum.ROUTE_NOT_FOUND,
				expected: "cette action n'existe pas sur le serveur",
			},
			{
				status: 400,
				code: TechnicalErrorCodeEnum.MALFORMED_JSON,
				expected: "la requête envoyée est illisible",
			},
		])(
			"SHOULD use the technical reason WHEN the code is $code",
			({ status, code, expected }) => {
				expect(getErrorReason(new ApiError({ status, code }))).toBe(expected);
			},
		);
	});

	describe("validation failures", () => {
		it("SHOULD name the field and its rule WHEN the refused field has a label", () => {
			expect(
				getErrorReason(NAME_TOO_LONG_ERROR, {
					fieldLabels: { name: "le nom" },
				}),
			).toBe("le nom doit contenir au plus 255 caractères");
		});

		it("SHOULD give the generic validation reason WHEN the refused field has no label", () => {
			expect(getErrorReason(NAME_TOO_LONG_ERROR)).toBe(
				"la saisie a été refusée",
			);
		});

		it("SHOULD give the generic validation reason WHEN the refusal lists no field", () => {
			const error = new ApiError({
				status: 400,
				code: TechnicalErrorCodeEnum.VALIDATION_FAILED,
			});

			expect(getErrorReason(error, { fieldLabels: { name: "le nom" } })).toBe(
				"la saisie a été refusée",
			);
		});
	});
});

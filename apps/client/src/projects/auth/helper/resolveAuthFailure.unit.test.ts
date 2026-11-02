import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum";
import { describe, expect, it } from "vitest";

import { ApiError } from "../../../common/api/error/ApiError";
import { resolveAuthFailure } from "./resolveAuthFailure";

const NOW = 1_000_000;

describe("resolveAuthFailure.ts", () => {
	describe("waits", () => {
		it.each([
			{ status: 429, code: AuthErrorCodeEnum.TOO_MANY_ATTEMPTS },
			{ status: 503, code: AuthErrorCodeEnum.AUTH_BUSY },
		])(
			"SHOULD wait the announced delay WHEN the server answers $status",
			({ status, code }) => {
				expect(
					resolveAuthFailure(
						new ApiError({ status, code, retryAfterSeconds: 2 }),
						"te connecter",
						NOW,
					),
				).toStrictEqual({ kind: "wait", retryAt: NOW + 2000, code });
			},
		);
	});

	describe("messages", () => {
		it("SHOULD give the reason of a business code, with the code", () => {
			expect(
				resolveAuthFailure(
					new ApiError({
						status: 401,
						code: AuthErrorCodeEnum.INVALID_CREDENTIALS,
					}),
					"te connecter",
					NOW,
				),
			).toStrictEqual({
				kind: "message",
				message:
					"Impossible de te connecter : identifiant ou mot de passe incorrect.",
				code: AuthErrorCodeEnum.INVALID_CREDENTIALS,
				isRetryable: false,
			});
		});

		it("SHOULD name the refused field WHEN the server refuses the input", () => {
			expect(
				resolveAuthFailure(
					new ApiError({
						status: 400,
						code: TechnicalErrorCodeEnum.VALIDATION_FAILED,
						issues: [
							{
								path: ["username"],
								code: ValidationIssueCodeEnum.INVALID_FORMAT,
								message: "Refused",
							},
						],
					}),
					"créer ton compte",
					NOW,
				),
			).toMatchObject({
				message:
					"Impossible de créer ton compte : le pseudo n'est pas au format attendu.",
			});
		});

		it("SHOULD offer to retry WHEN the server could not be reached", () => {
			expect(
				resolveAuthFailure(
					new ApiError({ status: null, code: null }),
					"envoyer l'email",
					NOW,
				),
			).toMatchObject({ kind: "message", isRetryable: true, code: null });
		});

		it("SHOULD give a plain message WHEN a 429 announces no delay", () => {
			expect(
				resolveAuthFailure(
					new ApiError({
						status: 429,
						code: TechnicalErrorCodeEnum.TOO_MANY_REQUESTS,
					}),
					"envoyer l'email",
					NOW,
				).kind,
			).toBe("message");
		});
	});
});

import { ContactErrorCodeEnum } from "@citadel/specs/src/projects/contact/error/contactErrorCode.enum";
import { MailErrorCodeEnum } from "@citadel/specs/src/projects/mail/error/mailErrorCode.enum";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";
import { describe, expect, it } from "vitest";

import { ApiError } from "../../../common/api/error/ApiError";
import { resolveContactFailure } from "./resolveContactFailure";

const NOW = Date.parse("2026-11-01T12:00:00Z");

describe("resolveContactFailure.ts", () => {
	describe("wait", () => {
		it("SHOULD block until the announced time WHEN the API answers 429 with Retry-After", () => {
			const error = new ApiError({
				status: 429,
				code: TechnicalErrorCodeEnum.TOO_MANY_REQUESTS,
				retryAfterSeconds: 90,
			});

			expect(resolveContactFailure(error, NOW)).toStrictEqual({
				kind: "wait",
				retryAt: NOW + 90_000,
			});
		});
	});

	describe("message", () => {
		it.each([
			{
				reason: "the quota closed the form",
				error: new ApiError({
					status: 403,
					code: ContactErrorCodeEnum.CONTACT_CLOSED,
				}),
				message:
					"Impossible d'envoyer le message : le formulaire est fermé pour aujourd'hui.",
				isRetryable: false,
			},
			{
				reason: "the mail provider failed",
				error: new ApiError({
					status: 502,
					code: MailErrorCodeEnum.MAIL_UNAVAILABLE,
				}),
				message:
					"Impossible d'envoyer le message : le service d'envoi de mails ne répond pas, réessayez plus tard.",
				isRetryable: true,
			},
			{
				reason: "a 429 came without delay",
				error: new ApiError({
					status: 429,
					code: TechnicalErrorCodeEnum.TOO_MANY_REQUESTS,
				}),
				message:
					"Impossible d'envoyer le message : trop de demandes d'affilée, réessayez dans un moment.",
				isRetryable: false,
			},
			{
				reason: "the server is unreachable",
				error: new ApiError({ status: null, code: null }),
				message:
					"Impossible d'envoyer le message : le serveur est injoignable.",
				isRetryable: true,
			},
		])(
			"SHOULD explain the failure, retryable only if passing, WHEN $reason",
			({ error, message, isRetryable }) => {
				expect(resolveContactFailure(error, NOW)).toStrictEqual({
					kind: "message",
					message,
					isRetryable,
				});
			},
		);
	});
});

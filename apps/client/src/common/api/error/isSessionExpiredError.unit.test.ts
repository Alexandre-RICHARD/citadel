import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";
import { describe, expect, it } from "vitest";

import { ApiError } from "./ApiError";
import { isSessionExpiredError } from "./isSessionExpiredError";

describe("isSessionExpiredError.ts", () => {
	describe("session expired", () => {
		it("SHOULD recognize the 401 of a protected endpoint", () => {
			expect(
				isSessionExpiredError(
					new ApiError({
						status: 401,
						code: TechnicalErrorCodeEnum.AUTHENTICATION_REQUIRED,
					}),
				),
			).toBe(true);
		});
	});

	describe("other errors", () => {
		it.each([
			{
				reason: "a password is refused",
				error: new ApiError({
					status: 401,
					code: AuthErrorCodeEnum.INVALID_CREDENTIALS,
				}),
			},
			{
				reason: "another status carries the code",
				error: new ApiError({
					status: 403,
					code: TechnicalErrorCodeEnum.AUTHENTICATION_REQUIRED,
				}),
			},
			{
				reason: "the server is unreachable",
				error: new ApiError({ status: null, code: null }),
			},
			{ reason: "it is not an API error", error: new Error("Boom") },
		])("SHOULD ignore it WHEN $reason", ({ error }) => {
			expect(isSessionExpiredError(error)).toBe(false);
		});
	});
});

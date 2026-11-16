import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";
import { describe, expect, it } from "vitest";

import { ApiError } from "./ApiError";
import { isLocalInstanceStartingError } from "./isLocalInstanceStartingError";

describe("isLocalInstanceStartingError.ts", () => {
	describe("local instance starting", () => {
		it("SHOULD recognize the answer of the console WHEN it starts the local instance", () => {
			expect(
				isLocalInstanceStartingError(
					new ApiError({
						status: 503,
						code: TechnicalErrorCodeEnum.LOCAL_INSTANCE_STARTING,
					}),
				),
			).toBe(true);
		});
	});

	describe("other errors", () => {
		it.each([
			{
				reason: "a proxy answers without a code",
				error: new ApiError({ status: 503, code: null }),
			},
			{
				reason: "the server failed",
				error: new ApiError({
					status: 500,
					code: TechnicalErrorCodeEnum.INTERNAL_ERROR,
				}),
			},
			{ reason: "it is not an API error", error: new Error("Boom") },
		])("SHOULD ignore it WHEN $reason", ({ error }) => {
			expect(isLocalInstanceStartingError(error)).toBe(false);
		});
	});
});

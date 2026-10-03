import { describe, expect, it } from "vitest";

import { ApiError } from "./ApiError";
import { isTransientApiError } from "./isTransientApiError";

describe("isTransientApiError.ts", () => {
	describe("transient failures", () => {
		it.each([
			{ reason: "no response arrived", status: null },
			{ reason: "the server failed", status: 500 },
			{ reason: "a proxy could not reach the server", status: 502 },
		])("SHOULD be transient WHEN $reason", ({ status }) => {
			expect(isTransientApiError(new ApiError({ status, code: null }))).toBe(
				true,
			);
		});
	});

	describe("definitive failures", () => {
		it.each([
			{ reason: "a refused input", status: 400 },
			{ reason: "a missing resource", status: 404 },
		])(
			"SHOULD not be transient WHEN the API answered $reason",
			({ status }) => {
				expect(isTransientApiError(new ApiError({ status, code: null }))).toBe(
					false,
				);
			},
		);

		it("SHOULD not be transient WHEN the error does not come from the API", () => {
			expect(
				isTransientApiError(new TypeError("undefined is not a function")),
			).toBe(false);
		});
	});
});

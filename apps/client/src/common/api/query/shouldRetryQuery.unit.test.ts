import { describe, expect, it } from "vitest";

import { ApiError } from "../error/ApiError";
import { shouldRetryQuery } from "./shouldRetryQuery";

const NETWORK_ERROR = new ApiError({ status: null, code: null });

describe("shouldRetryQuery.ts", () => {
	describe("transient failures", () => {
		it.each([{ failureCount: 0 }, { failureCount: 1 }])(
			"SHOULD retry WHEN the read failed $failureCount time(s) before",
			({ failureCount }) => {
				expect(shouldRetryQuery(failureCount, NETWORK_ERROR)).toBe(true);
			},
		);

		it("SHOULD stop WHEN the read was already retried twice", () => {
			expect(shouldRetryQuery(2, NETWORK_ERROR)).toBe(false);
		});
	});

	describe("definitive failures", () => {
		it.each([
			{
				reason: "a 404",
				error: new ApiError({ status: 404, code: "GAME_NOT_FOUND" }),
			},
			{ reason: "a bug", error: new TypeError("x is undefined") },
		])("SHOULD never retry WHEN the failure is $reason", ({ error }) => {
			expect(shouldRetryQuery(0, error)).toBe(false);
		});
	});
});

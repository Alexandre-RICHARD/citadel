import { describe, expect, it } from "vitest";

import { getTmdbRetryDelayMs } from "./getTmdbRetryDelayMs.ts";

describe("getTmdbRetryDelayMs.ts", () => {
	describe("Retry-After header", () => {
		it("SHOULD wait the seconds TMDB asks for WHEN the header is a positive number", () => {
			expect(getTmdbRetryDelayMs("3", 1)).toBe(3000);
		});
	});

	describe("no usable header", () => {
		it.each([
			{ retryAfter: null, attempt: 1, expected: 1000 },
			{ retryAfter: null, attempt: 3, expected: 4000 },
			{ retryAfter: "0", attempt: 2, expected: 2000 },
			{ retryAfter: "soon", attempt: 1, expected: 1000 },
		])(
			"SHOULD double the wait at each attempt WHEN the header is $retryAfter on attempt $attempt",
			({ retryAfter, attempt, expected }) => {
				expect(getTmdbRetryDelayMs(retryAfter, attempt)).toBe(expected);
			},
		);
	});
});

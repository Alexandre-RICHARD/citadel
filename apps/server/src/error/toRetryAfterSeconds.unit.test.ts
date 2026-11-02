import { describe, expect, it } from "vitest";

import { toRetryAfterSeconds } from "./toRetryAfterSeconds.ts";

describe("toRetryAfterSeconds.ts", () => {
	describe("rounding", () => {
		it.each([
			{ reason: "a whole number of seconds", milliseconds: 2000, seconds: 2 },
			{ reason: "a started second", milliseconds: 2001, seconds: 3 },
			{ reason: "less than a second", milliseconds: 1, seconds: 1 },
			{ reason: "no wait at all", milliseconds: 0, seconds: 1 },
		])(
			"SHOULD give $seconds s WHEN the wait is $reason",
			({ milliseconds, seconds }) => {
				expect(toRetryAfterSeconds(milliseconds)).toBe(seconds);
			},
		);
	});
});

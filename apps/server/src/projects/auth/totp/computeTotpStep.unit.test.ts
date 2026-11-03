import { describe, expect, it } from "vitest";

import { computeTotpStep } from "./computeTotpStep.ts";

describe("computeTotpStep.ts", () => {
	describe("steps", () => {
		it.each([
			{ seconds: 0, expected: 0 },
			{ seconds: 29.999, expected: 0 },
			{ seconds: 30, expected: 1 },
			{ seconds: 59, expected: 1 },
			{ seconds: 1_111_111_109, expected: 37_037_036 },
			{ seconds: 20_000_000_000, expected: 666_666_666 },
		])(
			"SHOULD give the step $expected WHEN $seconds seconds have passed since 1970",
			({ seconds, expected }) => {
				expect(computeTotpStep(seconds * 1000, 30)).toBe(expected);
			},
		);
	});
});

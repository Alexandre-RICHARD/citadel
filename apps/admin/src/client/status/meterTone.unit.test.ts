import { describe, expect, it } from "vitest";

import { meterTone } from "./meterTone";

describe("meterTone.ts", () => {
	describe("thresholds", () => {
		it.each([
			{ ratio: 0.5, expected: "ok" },
			{ ratio: 0.75, expected: "warn" },
			{ ratio: 0.89, expected: "warn" },
			{ ratio: 0.9, expected: "danger" },
		])(
			"SHOULD be $expected WHEN the gauge is at $ratio",
			({ ratio, expected }) => {
				expect(meterTone(ratio)).toBe(expected);
			},
		);
	});
});

import { describe, expect, it } from "vitest";

import { formatDuration } from "./formatDuration";

describe("formatDuration.ts", () => {
	describe("minutes", () => {
		it.each([
			{ minutes: 750, expected: "12 h 30" },
			{ minutes: 45, expected: "0 h 45" },
			{ minutes: 65, expected: "1 h 05" },
			{ minutes: 0, expected: "0 h 00" },
		])(
			"SHOULD write $expected WHEN the duration is $minutes minutes",
			({ minutes, expected }) => {
				expect(formatDuration(minutes)).toBe(expected);
			},
		);
	});
});

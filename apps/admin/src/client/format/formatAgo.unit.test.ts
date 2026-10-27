import { describe, expect, it } from "vitest";

import { formatAgo } from "./formatAgo";

const NOW = Date.parse("2026-10-27T12:00:00Z");

describe("formatAgo.ts", () => {
	describe("elapsed time", () => {
		it.each([
			{ isoDate: "2026-10-27T11:59:15Z", expected: "il y a 45 s" },
			{ isoDate: "2026-10-27T11:48:00Z", expected: "il y a 12 min" },
			{ isoDate: "2026-10-27T08:55:00Z", expected: "il y a 3 h 05" },
		])(
			"SHOULD write $expected WHEN the date is $isoDate",
			({ isoDate, expected }) => {
				expect(formatAgo(isoDate, NOW)).toBe(expected);
			},
		);
	});
});

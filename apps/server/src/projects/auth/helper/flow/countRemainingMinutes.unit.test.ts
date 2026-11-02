import { describe, expect, it } from "vitest";

import { countRemainingMinutes } from "./countRemainingMinutes.ts";

const NOW = new Date("2026-11-02T10:00:00.000Z");

function minutesLater(minutes: number): Date {
	return new Date(NOW.getTime() + minutes * 60_000);
}

describe("countRemainingMinutes.ts", () => {
	describe("time left", () => {
		it.each([
			{ reason: "exactly 30 minutes", endsAt: minutesLater(30), minutes: 30 },
			{
				reason: "29 minutes and a bit",
				endsAt: minutesLater(29.5),
				minutes: 30,
			},
			{ reason: "a few seconds", endsAt: minutesLater(0.1), minutes: 1 },
		])(
			"SHOULD give $minutes minutes WHEN $reason are left",
			({ endsAt, minutes }) => {
				expect(countRemainingMinutes(endsAt, NOW)).toBe(minutes);
			},
		);
	});

	describe("time over", () => {
		it.each([
			{ reason: "now", endsAt: NOW },
			{ reason: "in the past", endsAt: minutesLater(-5) },
		])("SHOULD give 0 WHEN the end is $reason", ({ endsAt }) => {
			expect(countRemainingMinutes(endsAt, NOW)).toBe(0);
		});
	});
});

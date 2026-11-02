import { describe, expect, it } from "vitest";

import { describeElapsedTime } from "./describeElapsedTime.ts";

const NOW = new Date("2026-11-02T12:00:00.000Z");

function daysAgo(days: number): Date {
	return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

describe("describeElapsedTime.ts", () => {
	describe("describeElapsedTime", () => {
		it("SHOULD say today WHEN the date is earlier the same Paris day", () => {
			expect(
				describeElapsedTime(new Date("2026-11-02T07:30:00.000Z"), NOW),
			).toBe("aujourd'hui");
		});

		it("SHOULD count calendar days in Paris WHEN the date is only a few hours before but on the previous day", () => {
			// 23 h 30 à Paris la veille
			expect(
				describeElapsedTime(new Date("2026-11-01T22:30:00.000Z"), NOW),
			).toBe("il y a 1 jour");
		});

		it.each([
			[2, "il y a 2 jours"],
			[7, "il y a 7 jours"],
			[8, "il y a 1 semaine"],
			[20, "il y a 2 semaines"],
			[35, "il y a 5 semaines"],
			[36, "il y a 1 mois"],
			[100, "il y a 3 mois"],
			[364, "il y a 12 mois"],
			[365, "il y a 1 an"],
			[800, "il y a 2 ans"],
		])(
			"SHOULD write the step of the scale WHEN the date is %i days ago",
			(days, expected) => {
				expect(describeElapsedTime(daysAgo(days), NOW)).toBe(expected);
			},
		);
	});
});

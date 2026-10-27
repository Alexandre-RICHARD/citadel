import { describe, expect, it } from "vitest";

import { splitMinutesIntoHours } from "./splitMinutesIntoHours.ts";

describe("splitMinutesIntoHours.ts", () => {
	describe("durations", () => {
		it.each([
			{ totalMinutes: 0, hours: 0, minutes: 0 },
			{ totalMinutes: 45, hours: 0, minutes: 45 },
			{ totalMinutes: 60, hours: 1, minutes: 0 },
			{ totalMinutes: 150, hours: 2, minutes: 30 },
		])(
			"SHOULD give $hours h and $minutes min WHEN the duration is $totalMinutes minutes",
			({ totalMinutes, hours, minutes }) => {
				expect(splitMinutesIntoHours(totalMinutes)).toStrictEqual({
					hours,
					minutes,
				});
			},
		);
	});
});

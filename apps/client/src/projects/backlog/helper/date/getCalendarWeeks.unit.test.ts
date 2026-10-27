import { describe, expect, it } from "vitest";

import { getCalendarWeeks } from "./getCalendarWeeks";

describe("getCalendarWeeks.ts", () => {
	describe("grid", () => {
		it("SHOULD return six weeks of seven days", () => {
			const weeks = getCalendarWeeks("2026-10-27");

			expect(weeks).toHaveLength(6);
			weeks.forEach((week) => expect(week).toHaveLength(7));
		});

		it("SHOULD start on the Monday before the first day of the month", () => {
			const [firstWeek] = getCalendarWeeks("2026-10-27");

			expect(firstWeek?.[0]).toStrictEqual({
				date: "2026-09-28",
				day: 28,
				isInMonth: false,
			});
			expect(firstWeek?.[3]).toStrictEqual({
				date: "2026-10-01",
				day: 1,
				isInMonth: true,
			});
		});

		it("SHOULD start on the first day WHEN the month starts on a Monday", () => {
			const [firstWeek] = getCalendarWeeks("2026-06-15");

			expect(firstWeek?.[0]?.date).toBe("2026-06-01");
		});

		it("SHOULD fill the last week with days of the next month", () => {
			const lastWeek = getCalendarWeeks("2026-10-27").at(-1);

			expect(lastWeek?.at(-1)).toStrictEqual({
				date: "2026-11-08",
				day: 8,
				isInMonth: false,
			});
		});
	});
});

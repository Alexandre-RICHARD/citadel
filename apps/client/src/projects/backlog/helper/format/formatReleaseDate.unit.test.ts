import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatReleaseDate } from "./formatReleaseDate";

describe("formatReleaseDate.ts", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 9, 27, 12));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("released game", () => {
		it.each(["2013-09-17", "2026-10-27"])(
			"SHOULD write the date WHEN the game came out on %s",
			(date) => {
				expect(formatReleaseDate(date, false)).toBe(
					`${date.slice(8)}/${date.slice(5, 7)}/${date.slice(0, 4)}`,
				);
			},
		);
	});

	describe("upcoming game", () => {
		it.each([
			{ reason: "its date is in the future", date: "2026-10-28" },
			{ reason: "it has no date", date: null },
		])("SHOULD say it is coming WHEN $reason", ({ date }) => {
			expect(formatReleaseDate(date, false)).toBe("à venir");
		});
	});

	describe("cancelled game", () => {
		it("SHOULD say it is cancelled, whatever its date", () => {
			expect(formatReleaseDate("2013-09-17", true)).toBe("annulé");
		});
	});
});

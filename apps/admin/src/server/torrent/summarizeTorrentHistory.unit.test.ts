import { describe, expect, it } from "vitest";

import { summarizeTorrentHistory } from "./summarizeTorrentHistory.ts";

// Dimanche 1er novembre 2026, 15 h, heure locale
const NOW = new Date(2026, 10, 1, 15, 0);

function sample(
	day: number,
	hour: number,
	downloaded: number,
	uploaded: number,
) {
	return {
		at: new Date(2026, 9, day, hour).toISOString(),
		downloaded,
		uploaded,
	};
}

describe("summarizeTorrentHistory.ts", () => {
	describe("days", () => {
		it("SHOULD count each gap between two samples on the day of the second WHEN reading hourly samples", () => {
			const history = summarizeTorrentHistory(
				[
					sample(31, 10, 100, 1000),
					sample(31, 11, 150, 1300),
					sample(31, 12, 160, 1400),
				],
				NOW,
			);
			expect(history.days[1]).toEqual({
				period: "2026-10-31",
				downloaded: 60,
				uploaded: 400,
			});
		});

		it("SHOULD give 7 days, today first, with zeros WHEN nothing was exchanged", () => {
			const history = summarizeTorrentHistory([], NOW);
			expect(history.days.map((day) => day.period)).toEqual([
				"2026-11-01",
				"2026-10-31",
				"2026-10-30",
				"2026-10-29",
				"2026-10-28",
				"2026-10-27",
				"2026-10-26",
			]);
			expect(history.days[0]).toEqual({
				period: "2026-11-01",
				downloaded: 0,
				uploaded: 0,
			});
		});

		it("SHOULD ignore a counter that goes back WHEN qBittorrent was reset", () => {
			const history = summarizeTorrentHistory(
				[sample(31, 10, 500, 500), sample(31, 11, 20, 30)],
				NOW,
			);
			expect(history.days[1]).toEqual({
				period: "2026-10-31",
				downloaded: 0,
				uploaded: 0,
			});
		});
	});

	describe("weeks", () => {
		it("SHOULD group by week starting on Monday WHEN samples span two weeks", () => {
			const history = summarizeTorrentHistory(
				[sample(25, 10, 0, 0), sample(26, 10, 10, 20), sample(31, 10, 40, 50)],
				NOW,
			);
			expect(history.weeks[0]).toEqual({
				period: "2026-10-26",
				downloaded: 40,
				uploaded: 50,
			});
			expect(history.weeks).toHaveLength(4);
		});
	});
});

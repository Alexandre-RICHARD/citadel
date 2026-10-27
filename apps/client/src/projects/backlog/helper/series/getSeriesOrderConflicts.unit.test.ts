import { describe, expect, it } from "vitest";

import type { SeriesEntryFm } from "../../api/model/seriesEntryFm.type";
import { getSeriesOrderConflicts } from "./getSeriesOrderConflicts";

function buildEntry(
	gameId: number,
	firstReleaseDate: string | null,
): SeriesEntryFm {
	return {
		gameId,
		seriesNumber: gameId,
		name: `Game ${gameId}`,
		frenchName: null,
		firstReleaseDate,
	};
}

describe("getSeriesOrderConflicts.ts", () => {
	describe("release order", () => {
		it("SHOULD find no conflict WHEN the games are in release order", () => {
			expect(
				getSeriesOrderConflicts([
					buildEntry(1, "2001-01-01"),
					buildEntry(2, "2005-01-01"),
				]).size,
			).toBe(0);
		});

		it("SHOULD link a game to the later game above it WHEN it came out before", () => {
			const later = buildEntry(1, "2010-01-01");

			const conflicts = getSeriesOrderConflicts([
				later,
				buildEntry(2, "2005-01-01"),
			]);

			expect(conflicts.get(2)).toBe(later);
		});

		it("SHOULD compare with the latest game so far, not only the one just above", () => {
			const latest = buildEntry(1, "2010-01-01");

			const conflicts = getSeriesOrderConflicts([
				latest,
				buildEntry(2, "2005-01-01"),
				buildEntry(3, "2008-01-01"),
			]);

			expect([...conflicts.keys()]).toStrictEqual([2, 3]);
			expect(conflicts.get(3)).toBe(latest);
		});
	});

	describe("unknown dates", () => {
		it("SHOULD skip the games without a release date", () => {
			expect(
				getSeriesOrderConflicts([
					buildEntry(1, "2010-01-01"),
					buildEntry(2, null),
					buildEntry(3, "2012-01-01"),
				]).size,
			).toBe(0);
		});
	});
});

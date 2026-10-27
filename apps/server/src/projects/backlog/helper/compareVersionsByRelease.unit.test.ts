import { describe, expect, it } from "vitest";

import { compareVersionsByRelease } from "./compareVersionsByRelease.ts";

const GAME_ID = 100;

function buildVersion(id: number, releaseDates: (string | null)[]) {
	return {
		id,
		platforms: releaseDates.map((releaseDate, index) => ({
			platform: {
				id: index + 1,
				shortName: `P${index}`,
				technicalName: `p${index}`,
				emulatedPlatformId: null,
			},
			releaseDate,
		})),
	};
}

function sortIds(versions: ReturnType<typeof buildVersion>[]): number[] {
	return versions
		.toSorted(compareVersionsByRelease(GAME_ID))
		.map(({ id }) => id);
}

describe("compareVersionsByRelease.ts", () => {
	describe("order", () => {
		it("SHOULD put the original first, whatever its date", () => {
			expect(
				sortIds([
					buildVersion(1, ["2001-01-01"]),
					buildVersion(GAME_ID, ["2010-01-01"]),
				]),
			).toStrictEqual([GAME_ID, 1]);
		});

		it("SHOULD sort the other versions by their earliest release on any platform", () => {
			expect(
				sortIds([
					buildVersion(1, ["2015-01-01"]),
					buildVersion(2, ["2020-01-01", "2012-01-01"]),
				]),
			).toStrictEqual([2, 1]);
		});

		it("SHOULD put the versions without a known date last", () => {
			expect(
				sortIds([buildVersion(1, [null]), buildVersion(2, ["2015-01-01"])]),
			).toStrictEqual([2, 1]);
		});

		it("SHOULD sort by id WHEN two versions came out the same day", () => {
			expect(
				sortIds([
					buildVersion(3, ["2015-01-01"]),
					buildVersion(2, ["2015-01-01"]),
				]),
			).toStrictEqual([2, 3]);
		});
	});
});

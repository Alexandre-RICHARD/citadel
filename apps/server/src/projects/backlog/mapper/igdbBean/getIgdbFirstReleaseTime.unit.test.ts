import { buildIgdbGameUrl } from "@citadel/specs/src/projects/backlog/helper/igdb/buildIgdbGameUrl.ts";
import { describe, expect, it } from "vitest";

import { getIgdbFirstReleaseTime } from "./getIgdbFirstReleaseTime.ts";

const VERSION = { id: 1, name: "Game", url: buildIgdbGameUrl("game") };

describe("getIgdbFirstReleaseTime.ts", () => {
	describe("release dates", () => {
		it("SHOULD return the earliest release, all platforms included", () => {
			expect(
				getIgdbFirstReleaseTime({
					...VERSION,
					release_dates: [{ date: 300 }, { date: 100 }, {}],
				}),
			).toBe(100);
		});

		it.each([
			{
				reason: "no release has a date",
				version: { ...VERSION, release_dates: [{}] },
			},
			{ reason: "there is no release", version: VERSION },
		])("SHOULD sort after every date WHEN $reason", ({ version }) => {
			expect(getIgdbFirstReleaseTime(version)).toBe(Number.MAX_SAFE_INTEGER);
		});
	});
});

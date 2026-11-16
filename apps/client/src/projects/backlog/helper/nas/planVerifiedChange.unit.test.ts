import { describe, expect, it } from "vitest";

import type { ShowEpisodeFm } from "../../api/model/media/showEpisodeFm.type";
import type { ShowSeasonFm } from "../../api/model/media/showSeasonFm.type";
import type { NasDetailsFm } from "../../api/model/nas/nasDetailsFm.type";
import { buildNasDetailsFm } from "../../api/testUtils/buildNasDetailsFm";
import { planVerifiedChange } from "./planVerifiedChange";

function episode(
	episodeId: number,
	nas: Partial<NasDetailsFm> | null,
	isAired = true,
): ShowEpisodeFm {
	return {
		episodeId,
		episodeNumber: episodeId,
		name: `Épisode ${episodeId}`,
		airDate: "2020-01-01",
		runtimeMinutes: 50,
		stillPath: null,
		isWatched: false,
		isAired,
		nas: nas === null ? null : buildNasDetailsFm(nas),
	};
}

function season(
	seasonId: number,
	episodes: ShowEpisodeFm[],
	isSpecials = false,
): ShowSeasonFm {
	return {
		seasonId,
		seasonNumber: isSpecials ? 0 : seasonId,
		name: `Saison ${seasonId}`,
		isSpecials,
		airDate: null,
		posterPath: null,
		runtimeMinutes: null,
		watchedEpisodeCount: 0,
		airedEpisodeCount: episodes.length,
		isWatched: false,
		episodes,
		nas: null,
	};
}

const SEASONS = [
	season(1, [
		episode(1, { verifiedCount: 1 }),
		episode(2, {}),
		episode(3, { verifiableCount: 0 }),
		episode(4, {}, false),
	]),
	season(2, [episode(5, {})]),
	season(9, [episode(9, null)], true),
];

describe("planVerifiedChange.ts", () => {
	describe("cascades", () => {
		it("SHOULD check the aired single-file episodes of the show not verified yet", () => {
			expect(
				planVerifiedChange(SEASONS, { kind: "show" }, false),
			).toStrictEqual({
				kind: "cascade",
				episodeIds: [2, 5],
				isVerified: true,
			});
		});

		it("SHOULD uncheck only the verified episodes of a season", () => {
			expect(
				planVerifiedChange(SEASONS, { kind: "season", seasonId: 1 }, true),
			).toStrictEqual({ kind: "direct", episodeIds: [1], isVerified: false });
		});
	});

	describe("nothing to change", () => {
		it("SHOULD give nothing WHEN the episode has no single file", () => {
			expect(
				planVerifiedChange(SEASONS, { kind: "episode", episodeId: 3 }, false),
			).toBeNull();
		});
	});
});

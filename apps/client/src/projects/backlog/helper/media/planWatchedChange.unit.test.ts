import { describe, expect, it } from "vitest";

import type { ShowEpisodeFm } from "../../api/model/media/showEpisodeFm.type";
import type { ShowSeasonFm } from "../../api/model/media/showSeasonFm.type";
import { planWatchedChange } from "./planWatchedChange";

function episode(
	episodeId: number,
	isWatched: boolean,
	isAired = true,
): ShowEpisodeFm {
	return {
		episodeId,
		episodeNumber: episodeId % 10,
		name: `Épisode ${episodeId}`,
		airDate: isAired ? "2020-01-01" : null,
		runtimeMinutes: 50,
		stillPath: null,
		isWatched,
		isAired,
	};
}

function season(
	seasonId: number,
	episodes: ShowEpisodeFm[],
	isSpecials = false,
): ShowSeasonFm {
	const aired = episodes.filter(({ isAired }) => isAired);
	return {
		seasonId,
		seasonNumber: isSpecials ? 0 : seasonId,
		name: isSpecials ? "Épisodes spéciaux" : `Saison ${seasonId}`,
		isSpecials,
		airDate: null,
		posterPath: null,
		runtimeMinutes: null,
		watchedEpisodeCount: aired.filter(({ isWatched }) => isWatched).length,
		airedEpisodeCount: aired.length,
		isWatched: aired.length > 0 && aired.every(({ isWatched }) => isWatched),
		episodes,
	};
}

// Saison 1 : 11 vu, 12 pas vu ; saison 2 : 21 pas vu, 22 vu, 23 pas diffusé ; spéciaux : 1 pas vu
const SEASONS = [
	season(1, [episode(11, true), episode(12, false)]),
	season(2, [episode(21, false), episode(22, true), episode(23, false, false)]),
	season(9, [episode(1, false)], true),
];

describe("planWatchedChange.ts", () => {
	describe("show and season", () => {
		it("SHOULD cascade on the aired unwatched episodes of the main seasons WHEN the show is checked", () => {
			expect(planWatchedChange(SEASONS, { kind: "show" }, false)).toStrictEqual(
				{
					kind: "cascade",
					change: { episodeIds: [12, 21], isWatched: true },
				},
			);
		});

		it("SHOULD uncheck every watched episode of the season WHEN the season is watched", () => {
			const watchedSeason = [season(1, [episode(11, true), episode(12, true)])];
			expect(
				planWatchedChange(
					watchedSeason,
					{ kind: "season", seasonId: 1 },
					false,
				),
			).toStrictEqual({
				kind: "cascade",
				change: { episodeIds: [11, 12], isWatched: false },
			});
		});

		it("SHOULD change the episode directly WHEN the season has only one to change", () => {
			expect(
				planWatchedChange(SEASONS, { kind: "season", seasonId: 1 }, false),
			).toStrictEqual({
				kind: "direct",
				change: { episodeIds: [12], isWatched: true },
			});
		});

		it("SHOULD change nothing WHEN no episode is aired", () => {
			const unaired = [season(1, [episode(11, false, false)])];
			expect(planWatchedChange(unaired, { kind: "show" }, false)).toBeNull();
		});
	});

	describe("episode", () => {
		it("SHOULD propose to check the previous aired unwatched episodes too", () => {
			expect(
				planWatchedChange(SEASONS, { kind: "episode", episodeId: 22 }, false),
			).toStrictEqual({
				kind: "direct",
				change: { episodeIds: [22], isWatched: false },
			});
			expect(
				planWatchedChange(SEASONS, { kind: "episode", episodeId: 21 }, false),
			).toStrictEqual({
				kind: "extend",
				change: { episodeIds: [21], isWatched: true },
				extended: { episodeIds: [12, 21], isWatched: true },
			});
		});

		it("SHOULD propose to uncheck the following watched episodes too", () => {
			expect(
				planWatchedChange(SEASONS, { kind: "episode", episodeId: 11 }, false),
			).toStrictEqual({
				kind: "extend",
				change: { episodeIds: [11], isWatched: false },
				extended: { episodeIds: [11, 22], isWatched: false },
			});
		});

		it("SHOULD change a special episode alone", () => {
			expect(
				planWatchedChange(SEASONS, { kind: "episode", episodeId: 1 }, false),
			).toStrictEqual({
				kind: "direct",
				change: { episodeIds: [1], isWatched: true },
			});
		});
	});
});

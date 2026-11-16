import { describe, expect, it } from "vitest";

import { fromShowSeasonListDtoToShowSeasonsFm } from "./fromShowSeasonListDtoToShowSeasonsFm";

describe("fromShowSeasonListDtoToShowSeasonsFm.ts", () => {
	describe("progress", () => {
		it("SHOULD count the aired episodes of each season, the specials included in their own season", () => {
			const [specials] = fromShowSeasonListDtoToShowSeasonsFm(
				{
					seasons: [
						{
							id: 1,
							seasonNumber: 0,
							name: "Specials",
							airDate: null,
							posterPath: null,
							episodes: [
								{
									id: 10,
									episodeNumber: 1,
									name: "Bonus",
									airDate: "2020-01-01",
									runtimeMinutes: 20,
									stillPath: null,
									isWatched: true,
								},
								{
									id: 11,
									episodeNumber: 2,
									name: "Plus tard",
									airDate: null,
									runtimeMinutes: null,
									stillPath: null,
									isWatched: false,
								},
							],
						},
					],
				},
				"2026-01-01",
			);
			expect(specials).toMatchObject({
				isSpecials: true,
				watchedEpisodeCount: 1,
				airedEpisodeCount: 1,
				runtimeMinutes: 20,
				isWatched: true,
			});
			expect(specials?.episodes.map(({ isAired }) => isAired)).toStrictEqual([
				true,
				false,
			]);
		});

		it("SHOULD give no season WHEN the media is a movie", () => {
			expect(
				fromShowSeasonListDtoToShowSeasonsFm(null, "2026-01-01"),
			).toStrictEqual([]);
		});
	});
});

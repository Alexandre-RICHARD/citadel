import { describe, expect, it } from "vitest";

import type { TmdbSeasonResponse } from "../type/tmdbSeasonResponse.type.ts";
import type { TmdbTvShowResponse } from "../type/tmdbTvShowResponse.type.ts";
import { fromTmdbShowResponse } from "./fromTmdbShowResponse.ts";

const SHOW: TmdbTvShowResponse = {
	id: 1396,
	name: "Breaking Bad",
	original_name: "Breaking Bad",
	original_language: "en",
	first_air_date: "2008-01-20",
	poster_path: "/bb.jpg",
	status: "Ended",
	in_production: false,
	seasons: [
		{ id: 3577, season_number: 1 },
		{ id: 3572, season_number: 0 },
	],
	external_ids: { imdb_id: "tt0903747" },
};

function buildSeason(
	id: number,
	seasonNumber: number,
	overrides: Partial<TmdbSeasonResponse> = {},
): TmdbSeasonResponse {
	return {
		id,
		season_number: seasonNumber,
		name: `Saison ${seasonNumber}`,
		air_date: "2008-01-20",
		poster_path: null,
		episodes: [],
		...overrides,
	};
}

describe("fromTmdbShowResponse.ts", () => {
	describe("show", () => {
		it("SHOULD keep the show fields and say whether TMDB still expects episodes", () => {
			expect(fromTmdbShowResponse(SHOW, [])).toStrictEqual({
				id: 1396,
				name: "Breaking Bad",
				originalName: "Breaking Bad",
				originalLanguage: "en",
				firstAirDate: "2008-01-20",
				imdbId: "tt0903747",
				posterPath: "/bb.jpg",
				isOngoing: false,
				seasons: [],
			});
		});
	});

	describe("seasons", () => {
		it("SHOULD sort the seasons by number, specials first", () => {
			const result = fromTmdbShowResponse(SHOW, [
				buildSeason(3577, 1),
				buildSeason(3572, 0),
			]);

			expect(
				result.seasons.map(({ seasonNumber }) => seasonNumber),
			).toStrictEqual([0, 1]);
		});

		it("SHOULD keep each episode and name the unnamed ones as TMDB does in French", () => {
			const result = fromTmdbShowResponse(SHOW, [
				buildSeason(3577, 1, {
					name: "",
					episodes: [
						{
							id: 62085,
							episode_number: 1,
							name: "Chute libre",
							air_date: "2008-01-20",
							runtime: 58,
							still_path: "/s1e1.jpg",
						},
						{
							id: 62086,
							episode_number: 2,
							name: null,
							air_date: "",
							runtime: 0,
							still_path: null,
						},
					],
				}),
			]);

			expect(result.seasons[0]).toStrictEqual({
				id: 3577,
				seasonNumber: 1,
				name: "Saison 1",
				airDate: "2008-01-20",
				posterPath: null,
				episodes: [
					{
						id: 62085,
						episodeNumber: 1,
						name: "Chute libre",
						airDate: "2008-01-20",
						runtimeMinutes: 58,
						stillPath: "/s1e1.jpg",
					},
					{
						id: 62086,
						episodeNumber: 2,
						name: "Épisode 2",
						airDate: null,
						runtimeMinutes: null,
						stillPath: null,
					},
				],
			});
		});
	});
});

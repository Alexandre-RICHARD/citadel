import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { describe, expect, it } from "vitest";

import { fromTmdbSearchResponse } from "./fromTmdbSearchResponse.ts";

describe("fromTmdbSearchResponse.ts", () => {
	describe("kinds of result", () => {
		it("SHOULD keep movies and shows in the order of TMDB, and drop people", () => {
			expect(
				fromTmdbSearchResponse({
					results: [
						{
							id: 1396,
							media_type: "tv",
							name: "Breaking Bad",
							original_name: "Breaking Bad",
							first_air_date: "2008-01-20",
							poster_path: "/bb.jpg",
						},
						{ id: 17_419, media_type: "person", name: "Bryan Cranston" },
						{
							id: 603,
							media_type: "movie",
							title: "Matrix",
							original_title: "The Matrix",
							release_date: "",
							poster_path: null,
						},
					],
				}),
			).toStrictEqual([
				{
					mediaType: MediaTypeEnum.SHOW,
					tmdbId: 1396,
					title: "Breaking Bad",
					originalTitle: "Breaking Bad",
					date: "2008-01-20",
					posterPath: "/bb.jpg",
				},
				{
					mediaType: MediaTypeEnum.MOVIE,
					tmdbId: 603,
					title: "Matrix",
					originalTitle: "The Matrix",
					date: null,
					posterPath: null,
				},
			]);
		});
	});

	describe("no result", () => {
		it("SHOULD give an empty list WHEN TMDB gives no results", () => {
			expect(fromTmdbSearchResponse({ results: null })).toStrictEqual([]);
		});
	});
});

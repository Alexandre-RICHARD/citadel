import { describe, expect, it } from "vitest";

import type { TmdbMovieResponse } from "../type/tmdbMovieResponse.type.ts";
import { fromTmdbMovieResponse } from "./fromTmdbMovieResponse.ts";

const MOVIE: TmdbMovieResponse = {
	id: 603,
	title: "Matrix",
	original_title: "The Matrix",
	original_language: "en",
	release_date: "1999-03-30",
	runtime: 136,
	imdb_id: "tt0133093",
	poster_path: "/matrix.jpg",
	belongs_to_collection: { id: 2344, name: "Matrix - Saga" },
};

describe("fromTmdbMovieResponse.ts", () => {
	describe("complete movie", () => {
		it("SHOULD keep every field the backlog stores", () => {
			expect(fromTmdbMovieResponse(MOVIE)).toStrictEqual({
				id: 603,
				title: "Matrix",
				originalTitle: "The Matrix",
				originalLanguage: "en",
				releaseDate: "1999-03-30",
				runtimeMinutes: 136,
				imdbId: "tt0133093",
				posterPath: "/matrix.jpg",
				collection: { id: 2344, name: "Matrix - Saga" },
			});
		});
	});

	describe("unknown values", () => {
		it("SHOULD turn the empty values of TMDB into null, and fall back on the original title", () => {
			expect(
				fromTmdbMovieResponse({
					...MOVIE,
					title: "",
					release_date: "",
					runtime: 0,
					imdb_id: "",
					poster_path: null,
					belongs_to_collection: null,
				}),
			).toMatchObject({
				title: "The Matrix",
				releaseDate: null,
				runtimeMinutes: null,
				imdbId: null,
				posterPath: null,
				collection: null,
			});
		});
	});
});

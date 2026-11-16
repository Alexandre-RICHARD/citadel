import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { describe, expect, it } from "vitest";

import { buildSurveyedMovie } from "../../../../testUtils/unit/backlog/buildSurveyedMovie.ts";
import { findForgottenMedia } from "./findForgottenMedia.ts";

const SURVEY = {
	formatVersion: 1 as const,
	surveyedAt: "2026-11-01T03:00:00.000Z",
	jellyfinServerId: null,
	movies: [buildSurveyedMovie(603), buildSurveyedMovie(348)],
	shows: [],
	unlinked: [
		{
			path: "/data/medias/movies/Dossier sans nom",
			trackedBy: null,
			fileCount: 1,
			sizeBytes: 10,
			isInJellyfin: false,
			torrentCount: 0,
		},
	],
};

describe("findForgottenMedia.ts", () => {
	describe("forgotten media", () => {
		it("SHOULD list what the backlog lacks, by title, then the folders by path", () => {
			const forgotten = findForgottenMedia(SURVEY, new Set(["movie:603"]));
			expect(forgotten.map(({ tmdbId, path }) => tmdbId ?? path)).toStrictEqual(
				[348, "/data/medias/movies/Dossier sans nom"],
			);
			expect(forgotten.at(0)).toMatchObject({
				mediaType: MediaTypeEnum.MOVIE,
				title: "Film 348",
				fileCount: 1,
				isInJellyfin: true,
				torrentCount: 0,
			});
		});
	});

	describe("nothing forgotten", () => {
		it("SHOULD keep a movie of the backlog out of the list", () => {
			expect(
				findForgottenMedia(
					{ ...SURVEY, unlinked: [] },
					new Set(["movie:603", "movie:348"]),
				),
			).toStrictEqual([]);
		});
	});
});

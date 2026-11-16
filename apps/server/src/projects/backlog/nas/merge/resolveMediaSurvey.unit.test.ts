import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum.ts";
import { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum.ts";
import { describe, expect, it } from "vitest";

import { buildSurveyedShow } from "../../../../testUtils/integration/backlog/nas/buildSurveyedShow.ts";
import { buildSurveyedMovie } from "../../../../testUtils/unit/backlog/buildSurveyedMovie.ts";
import { resolveMediaSurvey } from "./resolveMediaSurvey.ts";

const EMPTY = {
	formatVersion: 1 as const,
	surveyedAt: "2026-11-01T03:00:00.000Z",
	jellyfinServerId: null,
	movies: [],
	shows: [],
	unlinked: [],
};

describe("resolveMediaSurvey.ts", () => {
	describe("movies", () => {
		it("SHOULD file a movie under the backlog identifier, with the tool gap", () => {
			const misfiled = { ...buildSurveyedMovie(999), jellyfinTmdbId: 603 };
			const resolved = resolveMediaSurvey({ ...EMPTY, movies: [misfiled] }, [
				{
					mediaType: MediaTypeEnum.MOVIE,
					tmdbId: 603,
					normalizedTitles: [],
					year: null,
				},
			]);
			expect(resolved.movies.at(0)?.tmdbId).toBe(603);
			expect(resolved.movies.at(0)?.entry.gaps).toStrictEqual([
				{
					kind: NasGapKindEnum.TOOL_MISMATCH,
					tool: NasToolEnum.RADARR,
					tmdbId: 999,
				},
			]);
		});

		it("SHOULD leave a movie out of the backlog unchanged", () => {
			const movie = buildSurveyedMovie(348);
			expect(
				resolveMediaSurvey({ ...EMPTY, movies: [movie] }, []).movies,
			).toStrictEqual([movie]);
		});
	});

	describe("shows", () => {
		it("SHOULD put the Jellyfin gap on each episode with a file", () => {
			const show = { ...buildSurveyedShow(1396, [[1, 1]]), jellyfinTmdbId: 1 };
			const resolved = resolveMediaSurvey({ ...EMPTY, shows: [show] }, [
				{
					mediaType: MediaTypeEnum.SHOW,
					tmdbId: 1396,
					normalizedTitles: [],
					year: null,
				},
			]);
			expect(resolved.shows.at(0)?.episodes.at(0)?.entry.gaps).toStrictEqual([
				{ kind: NasGapKindEnum.JELLYFIN_MISMATCH, tmdbId: 1 },
			]);
		});
	});
});

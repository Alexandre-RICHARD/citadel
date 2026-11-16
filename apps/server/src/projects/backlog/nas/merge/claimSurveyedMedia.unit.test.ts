import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { describe, expect, it } from "vitest";

import { claimSurveyedMedia } from "./claimSurveyedMedia.ts";

function ref(tmdbId: number, title: string, year: number) {
	return {
		mediaType: MediaTypeEnum.MOVIE,
		tmdbId,
		normalizedTitles: [title],
		year,
	};
}

function candidate(
	tmdbId: number | null,
	{
		toolTmdbId = tmdbId,
		jellyfinTmdbId = tmdbId,
		folder = null,
	}: {
		toolTmdbId?: number | null;
		jellyfinTmdbId?: number | null;
		folder?: { path: string; title: string; year: number | null } | null;
	} = {},
) {
	return { tmdbId, toolTmdbId, jellyfinTmdbId, folder };
}

describe("claimSurveyedMedia.ts", () => {
	describe("by identifier", () => {
		it("SHOULD link a media to the entry of the same identifier", () => {
			expect(
				claimSurveyedMedia(
					[candidate(348), candidate(603)],
					[ref(603, "matrix", 1999)],
				),
			).toStrictEqual(new Map([[603, 1]]));
		});

		it("SHOULD link a media to an entry that a tool gives its identifier WHEN no entry has it", () => {
			expect(
				claimSurveyedMedia(
					[candidate(999, { jellyfinTmdbId: 603 })],
					[ref(603, "matrix", 1999)],
				),
			).toStrictEqual(new Map([[603, 0]]));
		});

		it("SHOULD keep an entry for the media of its own identifier", () => {
			expect(
				claimSurveyedMedia(
					[candidate(999, { jellyfinTmdbId: 603 })],
					[ref(603, "matrix", 1999), ref(999, "autre", 2001)],
				),
			).toStrictEqual(new Map([[999, 0]]));
		});
	});

	describe("by folder", () => {
		it("SHOULD link a media to a folder of its title and year", () => {
			expect(
				claimSurveyedMedia(
					[
						candidate(null, {
							folder: { path: "/x", title: "Matrix", year: 1999 },
						}),
					],
					[ref(603, "matrix", 1999)],
				),
			).toStrictEqual(new Map([[603, 0]]));
		});

		it("SHOULD prefer the exact year over a year off by one", () => {
			expect(
				claimSurveyedMedia(
					[
						candidate(null, {
							folder: { path: "/a", title: "Ca", year: 2018 },
						}),
						candidate(null, {
							folder: { path: "/b", title: "Ca", year: 2017 },
						}),
					],
					[ref(346364, "ca", 2017)],
				),
			).toStrictEqual(new Map([[346364, 1]]));
		});
	});

	describe("unlinked", () => {
		it("SHOULD leave a media without entry out", () => {
			expect(
				claimSurveyedMedia([candidate(348)], [ref(603, "matrix", 1999)]),
			).toStrictEqual(new Map());
		});
	});
});

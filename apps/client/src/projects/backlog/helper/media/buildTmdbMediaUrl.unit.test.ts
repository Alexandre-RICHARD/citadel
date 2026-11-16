import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { describe, expect, it } from "vitest";

import { buildTmdbMediaUrl } from "./buildTmdbMediaUrl";

describe("buildTmdbMediaUrl.ts", () => {
	describe("media types", () => {
		it.each([
			{ mediaType: MediaTypeEnum.MOVIE, expected: "movie/603" },
			{ mediaType: MediaTypeEnum.SHOW, expected: "tv/603" },
		])(
			"SHOULD lead to the TMDB page WHEN the media is a $mediaType",
			({ mediaType, expected }) => {
				expect(buildTmdbMediaUrl(mediaType, 603)).toBe(
					`https://www.themoviedb.org/${expected}`,
				);
			},
		);
	});
});

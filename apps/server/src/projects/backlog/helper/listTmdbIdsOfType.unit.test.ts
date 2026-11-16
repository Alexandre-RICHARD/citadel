import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { describe, expect, it } from "vitest";

import { listTmdbIdsOfType } from "./listTmdbIdsOfType.ts";

const MEDIA = [
	{ mediaType: MediaTypeEnum.MOVIE, tmdbId: 1 },
	{ mediaType: MediaTypeEnum.SHOW, tmdbId: 1 },
	{ mediaType: MediaTypeEnum.MOVIE, tmdbId: 2 },
];

describe("listTmdbIdsOfType.ts", () => {
	describe("filter by type", () => {
		it.each([
			{ mediaType: MediaTypeEnum.MOVIE, expected: [1, 2] },
			{ mediaType: MediaTypeEnum.SHOW, expected: [1] },
		])(
			"SHOULD keep the ids of the $mediaType items only, in order",
			({ mediaType, expected }) => {
				expect(listTmdbIdsOfType(MEDIA, mediaType)).toStrictEqual(expected);
			},
		);
	});
});

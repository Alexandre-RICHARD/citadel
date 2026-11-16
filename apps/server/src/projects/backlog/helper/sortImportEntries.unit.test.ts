import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { describe, expect, it } from "vitest";

import { sortImportEntries } from "./sortImportEntries.ts";

const NONE = { movies: new Set<number>(), shows: new Set<number>() };

function movie(tmdbId: number) {
	return { mediaType: MediaTypeEnum.MOVIE, tmdbId };
}

function show(tmdbId: number) {
	return { mediaType: MediaTypeEnum.SHOW, tmdbId };
}

describe("sortImportEntries.ts", () => {
	describe("duplicates", () => {
		it("SHOULD keep the first line and mark the next ones as duplicates", () => {
			const sorted = sortImportEntries(
				[movie(1), movie(1), show(1)],
				NONE,
				NONE,
			);

			expect(sorted.toFetch).toStrictEqual([movie(1), show(1)]);
			expect(sorted.duplicates).toStrictEqual([movie(1)]);
		});
	});

	describe("known media", () => {
		it("SHOULD set apart the media already in the backlog, then those already stored", () => {
			const sorted = sortImportEntries(
				[movie(1), show(2), movie(3)],
				{ movies: new Set([1]), shows: new Set() },
				{ movies: new Set([1]), shows: new Set([2]) },
			);

			expect(sorted).toStrictEqual({
				duplicates: [],
				alreadyInBacklog: [movie(1)],
				stored: [show(2)],
				toFetch: [movie(3)],
			});
		});

		it("SHOULD not mistake a show for a movie WHEN they share the same TMDB id", () => {
			const sorted = sortImportEntries(
				[show(1)],
				{ movies: new Set([1]), shows: new Set() },
				NONE,
			);

			expect(sorted.toFetch).toStrictEqual([show(1)]);
		});
	});
});

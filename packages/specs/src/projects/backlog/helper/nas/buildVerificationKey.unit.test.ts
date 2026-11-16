import { describe, expect, it } from "vitest";

import { buildVerificationKey } from "./buildVerificationKey.ts";

describe("buildVerificationKey.ts", () => {
	describe("keys", () => {
		it("SHOULD name a movie by its TMDB ID", () => {
			expect(buildVerificationKey({ kind: "movie", tmdbId: 603 })).toBe(
				"movie:603",
			);
		});

		it("SHOULD name an episode by its show, season and episode numbers", () => {
			expect(
				buildVerificationKey({
					kind: "episode",
					showTmdbId: 1396,
					seasonNumber: 2,
					episodeNumber: 5,
				}),
			).toBe("episode:1396:2:5");
		});
	});
});

import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { describe, expect, it } from "vitest";

import { matchesFolder } from "./matchesFolder.ts";

const REF = {
	mediaType: MediaTypeEnum.MOVIE,
	tmdbId: 346364,
	normalizedTitles: ["ca", "it"],
	year: 2017,
};

describe("matchesFolder.ts", () => {
	describe("same media", () => {
		it("SHOULD match the title and the year", () => {
			expect(
				matchesFolder(
					{ path: "/data/medias/movies/Ça (2017)", title: "Ça", year: 2017 },
					REF,
					0,
				),
			).toBe(true);
		});

		it("SHOULD accept a year off by one WHEN tolerated", () => {
			expect(
				matchesFolder({ path: "/x", title: "It", year: 2018 }, REF, 1),
			).toBe(true);
		});

		it("SHOULD match a folder without a year by its title", () => {
			expect(
				matchesFolder({ path: "/x", title: "It", year: null }, REF, 0),
			).toBe(true);
		});
	});

	describe("other media", () => {
		it("SHOULD refuse another title", () => {
			expect(
				matchesFolder({ path: "/x", title: "Alien", year: 2017 }, REF, 1),
			).toBe(false);
		});

		it("SHOULD refuse a year out of tolerance", () => {
			expect(
				matchesFolder({ path: "/x", title: "Ça", year: 1990 }, REF, 1),
			).toBe(false);
		});
	});
});

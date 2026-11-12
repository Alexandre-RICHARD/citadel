import { externalLinks } from "@citadel/specs/src/links/externalLinks.ts";
import { describe, expect, it } from "vitest";

import { fromIgdbVersionToVersionPlatformBeans } from "./fromIgdbVersionToVersionPlatformBeans.ts";

// 2011-09-22 et 2011-11-11 à 00:00 UTC
const SEPTEMBER = 1316649600;
const NOVEMBER = 1320969600;

describe("fromIgdbVersionToVersionPlatformBeans.ts", () => {
	describe("platforms", () => {
		it("SHOULD give each platform its earliest release on it, all regions included", () => {
			const beans = fromIgdbVersionToVersionPlatformBeans({
				id: 1,
				name: "Game",
				url: externalLinks.igdb,
				platforms: [
					{
						id: 6,
						name: "PC (Microsoft Windows)",
						abbreviation: "PC",
						slug: "win",
					},
					{ id: 9, name: "PlayStation 3", abbreviation: "PS3", slug: "ps3" },
				],
				release_dates: [
					{ date: NOVEMBER, platform: 6 },
					{ date: SEPTEMBER, platform: 6 },
					{ platform: 9 },
				],
			});

			expect(beans.map(({ releaseDate }) => releaseDate)).toStrictEqual([
				"2011-09-22",
				null,
			]);
			expect(beans[0]?.platform.shortName).toBe("PC");
		});

		it("SHOULD return no platform WHEN IGDB lists none", () => {
			expect(
				fromIgdbVersionToVersionPlatformBeans({
					id: 1,
					name: "Game",
					url: externalLinks.igdb,
				}),
			).toStrictEqual([]);
		});
	});
});

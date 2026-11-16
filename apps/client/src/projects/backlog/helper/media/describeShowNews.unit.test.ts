import { describe, expect, it } from "vitest";

import { describeShowNews } from "./describeShowNews";

describe("describeShowNews.ts", () => {
	describe("counts", () => {
		it.each([
			{
				seasons: 1,
				episodes: 8,
				expected: "1 nouvelle saison · 8 nouveaux épisodes",
			},
			{
				seasons: 2,
				episodes: 1,
				expected: "2 nouvelles saisons · 1 nouvel épisode",
			},
			{ seasons: 0, episodes: 3, expected: "3 nouveaux épisodes" },
		])(
			"SHOULD say $expected WHEN there are $seasons seasons and $episodes episodes",
			({ seasons, episodes, expected }) => {
				expect(describeShowNews(seasons, episodes)).toBe(expected);
			},
		);
	});
});

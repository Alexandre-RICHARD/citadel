import { describe, expect, it } from "vitest";

import type { TmdbShowData } from "../tmdb/type/tmdbShowData.type.ts";
import { countShowNews } from "./countShowNews.ts";

function buildShow(seasons: { id: number; episodeIds: number[] }[]) {
	return {
		id: 1,
		name: "Dark",
		originalName: "Dark",
		originalLanguage: "de",
		firstAirDate: "2017-12-01",
		imdbId: null,
		posterPath: null,
		isOngoing: true,
		seasons: seasons.map(({ id, episodeIds }, index) => ({
			id,
			seasonNumber: index + 1,
			name: `Saison ${index + 1}`,
			airDate: null,
			posterPath: null,
			episodes: episodeIds.map((episodeId, position) => ({
				id: episodeId,
				episodeNumber: position + 1,
				name: `Épisode ${position + 1}`,
				airDate: null,
				runtimeMinutes: null,
				stillPath: null,
			})),
		})),
	} satisfies TmdbShowData;
}

describe("countShowNews.ts", () => {
	describe("news", () => {
		it("SHOULD count the seasons and episodes the database does not have yet", () => {
			const show = buildShow([
				{ id: 10, episodeIds: [100, 101, 102] },
				{ id: 11, episodeIds: [110] },
			]);

			expect(
				countShowNews(show, {
					seasonIds: new Set([10]),
					episodeIds: new Set([100, 101]),
				}),
			).toStrictEqual({ newSeasonCount: 1, newEpisodeCount: 2 });
		});
	});

	describe("no news", () => {
		it("SHOULD count nothing WHEN the database has everything", () => {
			const show = buildShow([{ id: 10, episodeIds: [100] }]);

			expect(
				countShowNews(show, {
					seasonIds: new Set([10]),
					episodeIds: new Set([100]),
				}),
			).toStrictEqual({ newSeasonCount: 0, newEpisodeCount: 0 });
		});
	});
});

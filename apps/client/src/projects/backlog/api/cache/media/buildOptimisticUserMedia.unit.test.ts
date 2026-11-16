import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { describe, expect, it } from "vitest";

import type { MediaPreviewFm } from "../../model/media/mediaPreviewFm.type";
import { buildOptimisticUserMedia } from "./buildOptimisticUserMedia";

const SHOW_PREVIEW: MediaPreviewFm = {
	mediaType: MediaTypeEnum.SHOW,
	tmdbId: 1396,
	tmdbUrl: "https://www.themoviedb.org/tv/1396",
	title: "Breaking Bad",
	originalTitle: null,
	originalLanguage: "en",
	releaseDate: "2008-01-20",
	runtimeMinutes: null,
	posterPath: "/poster.jpg",
	collectionName: null,
	proposedSaga: null,
	isOngoing: false,
	seasons: [
		{
			seasonNumber: 0,
			name: "Épisodes spéciaux",
			isSpecials: true,
			airDate: null,
			episodes: [{ episodeNumber: 1, name: "Bonus", airDate: "2009-01-01" }],
		},
		{
			seasonNumber: 1,
			name: "Saison 1",
			isSpecials: false,
			airDate: "2008-01-20",
			episodes: [
				{ episodeNumber: 1, name: "Pilote", airDate: "2008-01-20" },
				{ episodeNumber: 2, name: "À venir", airDate: "2099-01-01" },
			],
		},
	],
	userMediaId: null,
};

describe("buildOptimisticUserMedia.ts", () => {
	describe("show", () => {
		it("SHOULD count only the aired episodes of the main seasons, and place it after the saga", () => {
			const userMedia = buildOptimisticUserMedia({
				id: -1,
				preview: SHOW_PREVIEW,
				imagePath: "/poster.jpg",
				saga: { id: 4, name: "Vince Gilligan" },
				sagaNumber: null,
				sagaEntries: [{ gameId: 9, seriesNumber: 1 }],
				now: "2026-01-01T00:00:00.000Z",
				today: "2026-01-01",
			});

			expect(userMedia).toMatchObject({
				id: -1,
				originalTitle: "Breaking Bad",
				airedEpisodeCount: 1,
				watchedEpisodeCount: 0,
				sagaNumber: 2,
				sagaNumberLabel: "2",
			});
		});
	});
});

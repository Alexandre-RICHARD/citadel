import type { ShowSeasonListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/showSeasonListDto.type";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { backlogQueryKeys } from "../../backlogQueryKeys";
import { setCachedEpisodesWatched } from "./setCachedEpisodesWatched";
import { summarizeCachedShow } from "./summarizeCachedShow";

function episode(id: number, isWatched: boolean) {
	return {
		id,
		episodeNumber: id,
		name: `Épisode ${id}`,
		airDate: "2020-01-01",
		runtimeMinutes: 50,
		stillPath: null,
		isWatched,
	};
}

function seed(): QueryClient {
	const queryClient = new QueryClient();
	queryClient.setQueryData<ShowSeasonListDto>(backlogQueryKeys.showSeasons(7), {
		seasons: [
			{
				id: 70,
				seasonNumber: 1,
				name: "Saison 1",
				airDate: null,
				posterPath: null,
				episodes: [episode(1, true), episode(2, false), episode(3, false)],
			},
		],
	});
	return queryClient;
}

describe("setCachedEpisodesWatched.ts", () => {
	describe("cached seasons", () => {
		it("SHOULD check the episodes and give only those that changed", () => {
			// Arrange
			const queryClient = seed();

			// Act
			const changedIds = setCachedEpisodesWatched(queryClient, 7, [1, 2], true);

			// Assert
			expect(changedIds).toStrictEqual([2]);
			expect(summarizeCachedShow(queryClient, 7)).toStrictEqual({
				watchedEpisodeCount: 2,
				airedEpisodeCount: 3,
				runtimeMinutes: 150,
				isWatched: false,
			});
		});
	});

	describe("seasons not read", () => {
		it("SHOULD change nothing and have no progress to give", () => {
			// Arrange
			const queryClient = new QueryClient();

			// Act
			const changedIds = setCachedEpisodesWatched(queryClient, 7, [1], true);

			// Assert
			expect(changedIds).toStrictEqual([]);
			expect(summarizeCachedShow(queryClient, 7)).toBeNull();
		});
	});
});

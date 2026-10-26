import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { backlogQueryKeys } from "../backlogQueryKeys";
import { buildUserGameDto } from "../testUtils/buildUserGameDto";
import { buildUserGameListData } from "../testUtils/buildUserGameListData";
import { removeCachedUserGame } from "./removeCachedUserGame";
import { restoreCachedUserGame } from "./restoreCachedUserGame";

const BY_NAME = backlogQueryKeys.userGameList({ sort: "name" });
const BY_RATING = backlogQueryKeys.userGameList({ sort: "rating:desc" });

describe("restoreCachedUserGame.ts", () => {
	describe("refused removal", () => {
		it("SHOULD put the row back at its place in every view, total included", () => {
			// Arrange
			const queryClient = new QueryClient();
			const byName = buildUserGameListData(
				[[buildUserGameDto(1)], [buildUserGameDto(2), buildUserGameDto(3)]],
				3,
			);
			const byRating = buildUserGameListData(
				[[buildUserGameDto(3), buildUserGameDto(2), buildUserGameDto(1)]],
				3,
			);
			queryClient.setQueryData(BY_NAME, byName);
			queryClient.setQueryData(BY_RATING, byRating);
			const removed = removeCachedUserGame(queryClient, 2);

			// Act
			if (removed !== null)
				restoreCachedUserGame(queryClient, removed.userGame, removed.positions);

			// Assert
			expect(queryClient.getQueryData(BY_NAME)).toStrictEqual(byName);
			expect(queryClient.getQueryData(BY_RATING)).toStrictEqual(byRating);
		});
	});

	describe("view gone meanwhile", () => {
		it("SHOULD leave a view alone WHEN it left the cache", () => {
			// Arrange
			const queryClient = new QueryClient();

			// Act
			restoreCachedUserGame(queryClient, buildUserGameDto(2), [
				{ queryKey: BY_NAME, pageIndex: 0, index: 0 },
			]);

			// Assert
			expect(queryClient.getQueryData(BY_NAME)).toBeUndefined();
		});
	});
});

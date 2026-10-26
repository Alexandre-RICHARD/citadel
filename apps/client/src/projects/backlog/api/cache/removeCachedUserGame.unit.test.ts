import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { backlogQueryKeys } from "../backlogQueryKeys";
import { buildUserGameDto } from "../testUtils/buildUserGameDto";
import { buildUserGameListData } from "../testUtils/buildUserGameListData";
import { removeCachedUserGame } from "./removeCachedUserGame";
import type { UserGameListData } from "./userGameListData.type";

const BY_NAME = backlogQueryKeys.userGameList({ sort: "name" });
const BY_RATING = backlogQueryKeys.userGameList({ sort: "rating:desc" });

describe("removeCachedUserGame.ts", () => {
	describe("cached row", () => {
		it("SHOULD remove the row from every view and lower the total on every page", () => {
			// Arrange
			const queryClient = new QueryClient();
			queryClient.setQueryData(
				BY_NAME,
				buildUserGameListData(
					[[buildUserGameDto(1)], [buildUserGameDto(2), buildUserGameDto(3)]],
					3,
				),
			);
			queryClient.setQueryData(
				BY_RATING,
				buildUserGameListData([[buildUserGameDto(2), buildUserGameDto(1)]], 2),
			);

			// Act
			const removed = removeCachedUserGame(queryClient, 2);

			// Assert
			expect(removed?.userGame.game.id).toBe(2);
			expect(removed?.positions).toStrictEqual([
				{ queryKey: BY_NAME, pageIndex: 1, index: 0 },
				{ queryKey: BY_RATING, pageIndex: 0, index: 0 },
			]);
			expect(queryClient.getQueryData<UserGameListData>(BY_NAME)).toStrictEqual(
				buildUserGameListData(
					[[buildUserGameDto(1)], [buildUserGameDto(3)]],
					2,
				),
			);
			expect(
				queryClient.getQueryData<UserGameListData>(BY_RATING),
			).toStrictEqual(buildUserGameListData([[buildUserGameDto(1)]], 1));
		});
	});

	describe("row out of the cache", () => {
		it("SHOULD change nothing and return null WHEN no loaded view shows the game", () => {
			// Arrange
			const queryClient = new QueryClient();
			const view = buildUserGameListData([[buildUserGameDto(1)], null], 1);
			queryClient.setQueryData(BY_NAME, view);

			// Act
			const removed = removeCachedUserGame(queryClient, 2);

			// Assert
			expect(removed).toBeNull();
			expect(queryClient.getQueryData(BY_NAME)).toStrictEqual(view);
		});
	});
});

import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { backlogQueryKeys } from "../backlogQueryKeys";
import { buildUserGameDto } from "../testUtils/buildUserGameDto";
import { buildUserGameListData } from "../testUtils/buildUserGameListData";
import { insertCachedUserGame } from "./insertCachedUserGame";

const BY_NAME = backlogQueryKeys.userGameList({ sort: "name" });
const EMPTY_VIEW = backlogQueryKeys.userGameList({ name: "zelda" });

describe("insertCachedUserGame.ts", () => {
	describe("loaded views", () => {
		it("SHOULD show the new row first in every view and raise the total on every page", () => {
			// Arrange
			const queryClient = new QueryClient();
			queryClient.setQueryData(
				BY_NAME,
				buildUserGameListData(
					[[buildUserGameDto(1)], [buildUserGameDto(2)]],
					2,
				),
			);
			queryClient.setQueryData(EMPTY_VIEW, buildUserGameListData([null], 0));

			// Act
			insertCachedUserGame(queryClient, buildUserGameDto(3));

			// Assert
			expect(queryClient.getQueryData(BY_NAME)).toStrictEqual(
				buildUserGameListData(
					[[buildUserGameDto(3), buildUserGameDto(1)], [buildUserGameDto(2)]],
					3,
				),
			);
			expect(queryClient.getQueryData(EMPTY_VIEW)).toStrictEqual(
				buildUserGameListData([[buildUserGameDto(3)]], 1),
			);
		});
	});

	describe("no loaded view", () => {
		it("SHOULD not create a view WHEN the table was never read", () => {
			// Arrange
			const queryClient = new QueryClient();

			// Act
			insertCachedUserGame(queryClient, buildUserGameDto(3));

			// Assert
			expect(
				queryClient.getQueriesData({ queryKey: backlogQueryKeys.userGames() }),
			).toStrictEqual([]);
		});
	});
});

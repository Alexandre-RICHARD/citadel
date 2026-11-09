import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { backlogQueryKeys } from "../backlogQueryKeys";
import { buildStoredGameListData } from "../testUtils/buildStoredGameListData";
import { removeCachedStoredGame } from "./removeCachedStoredGame";
import { restoreCachedStoredGame } from "./restoreCachedStoredGame";
import type { StoredGameListData } from "./storedGameListData.type";

const ALL = backlogQueryKeys.storedGameList("");
const FILTERED = backlogQueryKeys.storedGameList("zelda");

describe("removeCachedStoredGame.ts", () => {
	describe("listed game", () => {
		it("SHOULD remove the game from every list showing it and lower the total on every page", () => {
			// Arrange
			const queryClient = new QueryClient();
			queryClient.setQueryData(ALL, buildStoredGameListData([[1], [2, 3]], 3));
			queryClient.setQueryData(FILTERED, buildStoredGameListData([[2]], 1));

			// Act
			const snapshots = removeCachedStoredGame(queryClient, 2);

			// Assert
			expect(snapshots.map(({ queryKey }) => queryKey)).toStrictEqual([
				ALL,
				FILTERED,
			]);
			expect(queryClient.getQueryData<StoredGameListData>(ALL)).toStrictEqual(
				buildStoredGameListData([[1], [3]], 2),
			);
			expect(
				queryClient.getQueryData<StoredGameListData>(FILTERED),
			).toStrictEqual(buildStoredGameListData([[]], 0));
		});

		it("SHOULD put the lists back as they were WHEN the removal is restored", () => {
			// Arrange
			const queryClient = new QueryClient();
			const all = buildStoredGameListData([[1], [2, 3]], 3);
			queryClient.setQueryData(ALL, all);
			const snapshots = removeCachedStoredGame(queryClient, 2);

			// Act
			restoreCachedStoredGame(queryClient, snapshots);

			// Assert
			expect(queryClient.getQueryData<StoredGameListData>(ALL)).toStrictEqual(
				all,
			);
		});
	});

	describe("game out of the cache", () => {
		it("SHOULD change nothing and return no snapshot WHEN no loaded list shows the game", () => {
			// Arrange
			const queryClient = new QueryClient();
			const all = buildStoredGameListData([[1], null], 1);
			queryClient.setQueryData(ALL, all);

			// Act
			const snapshots = removeCachedStoredGame(queryClient, 2);

			// Assert
			expect(snapshots).toStrictEqual([]);
			expect(queryClient.getQueryData<StoredGameListData>(ALL)).toStrictEqual(
				all,
			);
		});
	});
});

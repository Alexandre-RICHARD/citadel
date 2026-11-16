import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { backlogQueryKeys } from "../../backlogQueryKeys";
import { buildUserMediaDto } from "../../testUtils/buildUserMediaDto";
import { buildUserMediaListData } from "../../testUtils/buildUserMediaListData";
import { removeCachedUserMedia } from "./removeCachedUserMedia";
import { restoreCachedUserMedia } from "./restoreCachedUserMedia";
import type { UserMediaListData } from "./userMediaListData.type";

const BY_TITLE = backlogQueryKeys.userMediaList({ sort: "title:asc" });
const SHOW = buildUserMediaDto(2, { mediaType: MediaTypeEnum.SHOW });

function seed(): QueryClient {
	const queryClient = new QueryClient();
	queryClient.setQueryData(
		BY_TITLE,
		buildUserMediaListData([[buildUserMediaDto(1)], [SHOW]], {
			matchedCount: 2,
			movieCount: 1,
			showCount: 1,
		}),
	);
	return queryClient;
}

describe("removeCachedUserMedia.ts", () => {
	describe("cached row", () => {
		it("SHOULD remove the row and lower the summary of its type on every page", () => {
			// Arrange
			const queryClient = seed();

			// Act
			const removed = removeCachedUserMedia(queryClient, 2);

			// Assert
			expect(removed).toStrictEqual({
				userMedia: SHOW,
				positions: [{ queryKey: BY_TITLE, pageIndex: 1, index: 0 }],
			});
			expect(
				queryClient.getQueryData<UserMediaListData>(BY_TITLE),
			).toStrictEqual(
				buildUserMediaListData([[buildUserMediaDto(1)], []], {
					matchedCount: 1,
					movieCount: 1,
					showCount: 0,
				}),
			);
		});

		it("SHOULD put the row back at its place WHEN it is restored", () => {
			// Arrange
			const queryClient = seed();
			const removed = removeCachedUserMedia(queryClient, 2);

			// Act
			if (removed !== null)
				restoreCachedUserMedia(
					queryClient,
					removed.userMedia,
					removed.positions,
				);

			// Assert
			expect(
				queryClient.getQueryData<UserMediaListData>(BY_TITLE),
			).toStrictEqual(seed().getQueryData(BY_TITLE));
		});
	});

	describe("absent row", () => {
		it("SHOULD change nothing WHEN no view has the row", () => {
			// Arrange
			const queryClient = seed();

			// Act
			const removed = removeCachedUserMedia(queryClient, 9);

			// Assert
			expect(removed).toBeNull();
			expect(
				queryClient.getQueryData<UserMediaListData>(BY_TITLE),
			).toStrictEqual(seed().getQueryData(BY_TITLE));
		});
	});
});

import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { backlogQueryKeys } from "../../backlogQueryKeys";
import { buildUserMediaDto } from "../../testUtils/buildUserMediaDto";
import { buildUserMediaListData } from "../../testUtils/buildUserMediaListData";
import { insertCachedUserMedia } from "./insertCachedUserMedia";
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

describe("insertCachedUserMedia.ts", () => {
	describe("loaded view", () => {
		it("SHOULD put the row first and raise the summary of its type", () => {
			// Arrange
			const queryClient = seed();
			const added = buildUserMediaDto(-1);

			// Act
			insertCachedUserMedia(queryClient, added);

			// Assert
			expect(
				queryClient.getQueryData<UserMediaListData>(BY_TITLE),
			).toStrictEqual(
				buildUserMediaListData([[added, buildUserMediaDto(1)], [SHOW]], {
					matchedCount: 3,
					movieCount: 2,
					showCount: 1,
				}),
			);
		});
	});

	describe("empty backlog", () => {
		it("SHOULD leave the empty view WHEN the backlog had no media", () => {
			// Arrange
			const queryClient = new QueryClient();
			const empty = buildUserMediaListData([null], {
				matchedCount: 0,
				movieCount: 0,
				showCount: 0,
			});
			queryClient.setQueryData(BY_TITLE, empty);

			// Act
			insertCachedUserMedia(queryClient, buildUserMediaDto(-1));

			// Assert
			expect(queryClient.getQueryData(BY_TITLE)).toStrictEqual(empty);
		});
	});
});

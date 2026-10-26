import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { ApiError } from "../../../../common/api/error/ApiError";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { buildUserGameDto } from "../testUtils/buildUserGameDto";
import { buildUserGameListData } from "../testUtils/buildUserGameListData";
import { forgetGoneUserGame } from "./forgetGoneUserGame";

const VIEW = backlogQueryKeys.userGameList({});

function setUp(): QueryClient {
	const queryClient = new QueryClient();
	queryClient.setQueryData(
		VIEW,
		buildUserGameListData([[buildUserGameDto(1), buildUserGameDto(2)]], 2),
	);
	return queryClient;
}

describe("forgetGoneUserGame.ts", () => {
	describe("game gone", () => {
		it.each([
			BacklogErrorCodeEnum.USER_GAME_NOT_FOUND,
			BacklogErrorCodeEnum.GAME_NOT_FOUND,
		])("SHOULD remove the game row WHEN the API answered %s", (code) => {
			// Arrange
			const queryClient = setUp();

			// Act
			forgetGoneUserGame(queryClient, new ApiError({ status: 404, code }), 1);

			// Assert
			expect(queryClient.getQueryData(VIEW)).toStrictEqual(
				buildUserGameListData([[buildUserGameDto(2)]], 1),
			);
		});
	});

	describe("other resource gone", () => {
		it("SHOULD keep the game row WHEN only a user version is gone", () => {
			// Arrange
			const queryClient = setUp();

			// Act
			forgetGoneUserGame(
				queryClient,
				new ApiError({
					status: 404,
					code: BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND,
				}),
				1,
			);

			// Assert
			expect(queryClient.getQueryData(VIEW)).toStrictEqual(
				buildUserGameListData([[buildUserGameDto(1), buildUserGameDto(2)]], 2),
			);
		});
	});
});

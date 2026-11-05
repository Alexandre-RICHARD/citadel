import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

function deleteUrl(gameId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-games/${gameId}`;
}

describe("deleteUserGame", () => {
	describe("204 No Content", () => {
		it("SHOULD remove the game from the backlog with its played versions and done DLC, and keep it stored", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: "Hand-made",
			});
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				seriesId,
				seriesNumber: 1,
				userVersionStatuses: [StatusEnum.STARTED, StatusEnum.FINISHED],
				dlcNames: ["Only DLC"],
			});
			await insertBacklogRows.doneDlc({
				userVersionId: backlogGame.userVersionIds[0] ?? 0,
				dlcId: backlogGame.dlcIds[0] ?? 0,
			});

			// Act
			const response = await player.agent.delete(deleteUrl(backlogGame.gameId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(
				await selectBacklogRows.userGame(player.userId, backlogGame.gameId),
			).toBeNull();
			expect(
				await selectBacklogRows.userVersions(player.userId, backlogGame.gameId),
			).toStrictEqual([]);
			expect(
				await selectBacklogRows.doneDlcIds(backlogGame.userVersionIds[0] ?? 0),
			).toStrictEqual([]);
			expect(await selectBacklogRows.series(seriesId)).toBeNull();
			expect(await selectBacklogRows.gameIds(backlogGame.gameId)).toStrictEqual(
				{
					versionIds: backlogGame.versionIds,
					dlcIds: backlogGame.dlcIds,
				},
			);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the game is not in the backlog, deleting nothing, WHEN only another account has it", async () => {
			// Arrange
			const other = await openSignedInAgent();
			const othersGame = await seedBacklogGame({ userId: other.userId });

			// Act
			const response = await player.agent.delete(deleteUrl(othersGame.gameId));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_GAME_NOT_FOUND,
				`No backlog game with id : ${othersGame.gameId}`,
			);
			expect(
				await selectBacklogRows.userGame(other.userId, othersGame.gameId),
			).not.toBeNull();
			expect(
				await selectBacklogRows.userVersions(other.userId, othersGame.gameId),
			).toHaveLength(1);
		});

		it("SHOULD answer that the game is not in the backlog", async () => {
			// Act
			const response = await player.agent.delete(deleteUrl(NON_EXISTENT_ID));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_GAME_NOT_FOUND,
				`No backlog game with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).delete(deleteUrl(1));

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

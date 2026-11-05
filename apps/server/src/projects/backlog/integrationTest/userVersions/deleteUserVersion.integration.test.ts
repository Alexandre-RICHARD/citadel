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

function deleteUrl(id: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-versions/${id}`;
}

describe("deleteUserVersion", () => {
	describe("204 No Content", () => {
		it("SHOULD remove the played version and its done DLC, and keep the game in the backlog", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				userVersionStatuses: [StatusEnum.STARTED, StatusEnum.FINISHED],
				dlcNames: ["DLC"],
			});
			const [removedId = 0, keptId = 0] = backlogGame.userVersionIds;
			await insertBacklogRows.doneDlc({
				userVersionId: removedId,
				dlcId: backlogGame.dlcIds[0] ?? 0,
			});

			// Act
			const response = await player.agent.delete(deleteUrl(removedId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(
				(
					await selectBacklogRows.userVersions(
						player.userId,
						backlogGame.gameId,
					)
				).map(({ id }) => id),
			).toStrictEqual([keptId]);
			expect(await selectBacklogRows.doneDlcIds(removedId)).toStrictEqual([]);
			expect(
				await selectBacklogRows.userGame(player.userId, backlogGame.gameId),
			).not.toBeNull();
		});

		it("SHOULD remove the game from the backlog WHEN its last played version goes", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
			});

			// Act
			await player.agent.delete(deleteUrl(backlogGame.userVersionIds[0] ?? 0));

			// Assert
			expect(
				await selectBacklogRows.userGame(player.userId, backlogGame.gameId),
			).toBeNull();
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the played version does not exist, deleting nothing, WHEN it belongs to another account", async () => {
			// Arrange
			const other = await openSignedInAgent();
			const othersGame = await seedBacklogGame({ userId: other.userId });
			const [userVersionId = 0] = othersGame.userVersionIds;

			// Act
			const response = await player.agent.delete(deleteUrl(userVersionId));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND,
				`No played version with id : ${userVersionId}`,
			);
			expect(
				await selectBacklogRows.userVersions(other.userId, othersGame.gameId),
			).toHaveLength(1);
		});

		it("SHOULD answer that the played version does not exist", async () => {
			// Act
			const response = await player.agent.delete(deleteUrl(NON_EXISTENT_ID));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND,
				`No played version with id : ${NON_EXISTENT_ID}`,
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

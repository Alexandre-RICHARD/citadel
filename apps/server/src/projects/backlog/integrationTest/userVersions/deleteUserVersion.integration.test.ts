import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";

function deleteUrl(id: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-versions/${id}`;
}

describe("deleteUserVersion", () => {
	describe("204 No Content", () => {
		it("SHOULD remove the played version and its done DLC, and keep the game in the backlog", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userVersionStatuses: [StatusEnum.STARTED, StatusEnum.FINISHED],
				dlcNames: ["DLC"],
			});
			const [removedId = 0, keptId = 0] = backlogGame.userVersionIds;
			await insertBacklogRows.doneDlc({
				userVersionId: removedId,
				dlcId: backlogGame.dlcIds[0] ?? 0,
			});

			// Act
			const response = await request(app).delete(deleteUrl(removedId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(
				(await selectBacklogRows.userVersions(backlogGame.gameId)).map(
					({ id }) => id,
				),
			).toStrictEqual([keptId]);
			expect(await selectBacklogRows.doneDlcIds(removedId)).toStrictEqual([]);
			expect(
				await selectBacklogRows.userGame(backlogGame.gameId),
			).not.toBeNull();
		});

		it("SHOULD remove the game from the backlog WHEN its last played version goes", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame();

			// Act
			await request(app).delete(deleteUrl(backlogGame.userVersionIds[0] ?? 0));

			// Assert
			expect(await selectBacklogRows.userGame(backlogGame.gameId)).toBeNull();
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the played version does not exist", async () => {
			// Act
			const response = await request(app).delete(deleteUrl(NON_EXISTENT_ID));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND,
				`No played version with id : ${NON_EXISTENT_ID}`,
			);
		});
	});
});

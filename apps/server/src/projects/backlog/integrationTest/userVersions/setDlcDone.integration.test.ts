import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";

function doneDlcUrl(userVersionId: number, dlcId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-versions/${userVersionId}/done-dlcs/${dlcId}`;
}

describe("setDlcDone", () => {
	describe("200 OK", () => {
		it("SHOULD check the DLC as done, twice without effect, then uncheck it", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({ dlcNames: ["Dawnguard"] });
			const [userVersionId = 0] = backlogGame.userVersionIds;
			const [dlcId = 0] = backlogGame.dlcIds;

			// Act
			const firstResponse = await request(app)
				.patch(doneDlcUrl(userVersionId, dlcId))
				.send({ isDone: true });
			await request(app)
				.patch(doneDlcUrl(userVersionId, dlcId))
				.send({ isDone: true });
			const doneIdsAfterTwice =
				await selectBacklogRows.doneDlcIds(userVersionId);
			await request(app)
				.patch(doneDlcUrl(userVersionId, dlcId))
				.send({ isDone: false });

			// Assert
			expect(firstResponse.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(firstResponse.body as UserGameDto).userVersions[0]?.doneDlcIds,
			).toStrictEqual([dlcId]);
			expect(doneIdsAfterTwice).toStrictEqual([dlcId]);
			expect(await selectBacklogRows.doneDlcIds(userVersionId)).toStrictEqual(
				[],
			);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD refuse a DLC of another game", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame();
			const other = await seedStoredGame({ dlcNames: ["Not mine"] });
			const [dlcId = 0] = other.dlcIds;

			// Act
			const response = await request(app)
				.patch(doneDlcUrl(backlogGame.userVersionIds[0] ?? 0, dlcId))
				.send({ isDone: true });

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.DLC_NOT_FOUND,
				`No DLC with id ${dlcId} for game : ${backlogGame.gameId}`,
			);
		});
	});
});

import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

function doneDlcUrl(userVersionId: number, dlcId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-versions/${userVersionId}/done-dlcs/${dlcId}`;
}

describe("setDlcDone", () => {
	describe("200 OK", () => {
		it("SHOULD check the DLC as done, twice without effect, then uncheck it", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				dlcNames: ["Dawnguard"],
			});
			const [userVersionId = 0] = backlogGame.userVersionIds;
			const [dlcId = 0] = backlogGame.dlcIds;

			// Act
			const firstResponse = await player.agent
				.patch(doneDlcUrl(userVersionId, dlcId))
				.send({ isDone: true });
			await player.agent
				.patch(doneDlcUrl(userVersionId, dlcId))
				.send({ isDone: true });
			const doneIdsAfterTwice =
				await selectBacklogRows.doneDlcIds(userVersionId);
			await player.agent
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
		it("SHOULD answer that the played version does not exist, changing nothing, WHEN it belongs to another account", async () => {
			// Arrange
			const other = await openSignedInAgent();
			const othersGame = await seedBacklogGame({
				userId: other.userId,
				dlcNames: ["Dawnguard"],
			});
			const [userVersionId = 0] = othersGame.userVersionIds;
			const [dlcId = 0] = othersGame.dlcIds;

			// Act
			const response = await player.agent
				.patch(doneDlcUrl(userVersionId, dlcId))
				.send({ isDone: true });

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND,
				`No played version with id : ${userVersionId}`,
			);
			expect(await selectBacklogRows.doneDlcIds(userVersionId)).toStrictEqual(
				[],
			);
		});

		it("SHOULD refuse a DLC of another game", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
			});
			const other = await seedStoredGame({ dlcNames: ["Not mine"] });
			const [dlcId = 0] = other.dlcIds;

			// Act
			const response = await player.agent
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

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app)
				.patch(doneDlcUrl(1, 1))
				.send({ isDone: true });

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

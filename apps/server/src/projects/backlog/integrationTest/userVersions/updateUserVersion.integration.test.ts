import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

function updateUrl(id: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-versions/${id}`;
}

describe("updateUserVersion", () => {
	describe("200 OK", () => {
		it("SHOULD change only the given fields and give the row", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
			});
			const [userVersionId = 0] = backlogGame.userVersionIds;

			// Act
			const response = await player.agent
				.patch(updateUrl(userVersionId))
				.send({ rating: 15, comment: "", trackedPlayTimeMinutes: 90 });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				await selectBacklogRows.userVersions(player.userId, backlogGame.gameId),
			).toMatchObject([
				{
					id: userVersionId,
					status: StatusEnum.NOT_STARTED,
					rating: 15,
					// Un commentaire vide devient null
					comment: null,
					trackedPlayTimeMinutes: 90,
					sureFinishCount: 0,
				},
			]);
		});

		it("SHOULD count a first sure finish WHEN the status reaches rank 5", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
			});

			// Act
			await player.agent
				.patch(updateUrl(backlogGame.userVersionIds[0] ?? 0))
				.send({ status: StatusEnum.COMPLETED });

			// Assert
			expect(
				(
					await selectBacklogRows.userVersions(
						player.userId,
						backlogGame.gameId,
					)
				)[0]?.sureFinishCount,
			).toBe(1);
		});

		it("SHOULD save the in progress box, independently of the status and of the up next box", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
			});

			// Act
			const response = await player.agent
				.patch(updateUrl(backlogGame.userVersionIds[0] ?? 0))
				.send({ isInProgress: true });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(
					await selectBacklogRows.userVersions(
						player.userId,
						backlogGame.gameId,
					)
				)[0],
			).toMatchObject({
				isInProgress: true,
				isUpNext: false,
				status: StatusEnum.NOT_STARTED,
			});
		});

		it("SHOULD count a first sure finish WHEN the status is watched", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
			});

			// Act
			await player.agent
				.patch(updateUrl(backlogGame.userVersionIds[0] ?? 0))
				.send({ status: StatusEnum.WATCHED });

			// Assert
			expect(
				(
					await selectBacklogRows.userVersions(
						player.userId,
						backlogGame.gameId,
					)
				)[0]?.sureFinishCount,
			).toBe(1);
		});

		it.each(Object.values(EndingTypeEnum))(
			"SHOULD accept a finished status WHEN the game has the ending type %s",
			async (endingType) => {
				// Arrange
				const backlogGame = await seedBacklogGame({
					userId: player.userId,
					endingType,
				});

				// Act
				const response = await player.agent
					.patch(updateUrl(backlogGame.userVersionIds[0] ?? 0))
					.send({ status: StatusEnum.WATCHED });

				// Assert
				expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			},
		);

		it("SHOULD keep the counter sent with the status", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
			});

			// Act
			await player.agent
				.patch(updateUrl(backlogGame.userVersionIds[0] ?? 0))
				.send({ status: StatusEnum.FINISHED, sureFinishCount: 0 });

			// Assert
			expect(
				(
					await selectBacklogRows.userVersions(
						player.userId,
						backlogGame.gameId,
					)
				)[0]?.sureFinishCount,
			).toBe(0);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD reject an empty body", async () => {
			// Act
			const response = await player.agent.patch(updateUrl(42)).send({});

			// Assert
			expectValidationError(response, [
				{
					path: [],
					code: ValidationIssueCodeEnum.MISSING_FIELDS,
					message: expect.stringContaining("At least one of") as string,
				},
			]);
		});

		it("SHOULD reject a rating above 20", async () => {
			// Act
			const response = await player.agent
				.patch(updateUrl(42))
				.send({ rating: 25 });

			// Assert
			expectValidationError(response, [
				{
					path: ["rating"],
					code: ValidationIssueCodeEnum.TOO_BIG,
					limit: 20,
					message: "Rating should be at most 20",
				},
			]);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the played version does not exist, changing nothing, WHEN it belongs to another account", async () => {
			// Arrange
			const other = await openSignedInAgent();
			const othersGame = await seedBacklogGame({ userId: other.userId });
			const [userVersionId = 0] = othersGame.userVersionIds;

			// Act
			const response = await player.agent
				.patch(updateUrl(userVersionId))
				.send({ isOwned: true });

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND,
				`No played version with id : ${userVersionId}`,
			);
			expect(
				await selectBacklogRows.userVersions(other.userId, othersGame.gameId),
			).toMatchObject([{ isOwned: false }]);
		});

		it("SHOULD answer that the played version does not exist", async () => {
			// Act
			const response = await player.agent
				.patch(updateUrl(NON_EXISTENT_ID))
				.send({ isOwned: true });

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND,
				`No played version with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse a finished status WHEN the game has no ending type", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				endingType: null,
			});

			// Act
			const response = await player.agent
				.patch(updateUrl(backlogGame.userVersionIds[0] ?? 0))
				.send({ status: StatusEnum.COMPLETED });

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.STATUS_NOT_ALLOWED,
				`Status ${StatusEnum.COMPLETED} needs an ending type, the game has none`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app)
				.patch(updateUrl(1))
				.send({ isOwned: true });

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

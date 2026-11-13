import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

function customizeUrl(gameId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-games/${gameId}`;
}

describe("customizeUserGame", () => {
	describe("200 OK", () => {
		it("SHOULD save the new choices and leave the statuses as they are", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				userVersionStatuses: [
					StatusEnum.FINISHED,
					StatusEnum.WATCHED,
					StatusEnum.PLATINUM,
				],
			});

			// Act
			const response = await player.agent
				.put(customizeUrl(backlogGame.gameId))
				.send({
					imageId: "ar42",
					endingType: EndingTypeEnum.SANDBOX,
					series: { kind: SeriesChoiceKindEnum.NONE },
					seriesNumber: 4,
				});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({
				imageId: "ar42",
				endingType: EndingTypeEnum.SANDBOX,
				series: null,
				seriesNumber: null,
			});
			expect(
				(
					await selectBacklogRows.userVersions(
						player.userId,
						backlogGame.gameId,
					)
				).map(({ status }) => status),
			).toStrictEqual([
				StatusEnum.FINISHED,
				StatusEnum.WATCHED,
				StatusEnum.PLATINUM,
			]);
		});

		it("SHOULD remove a hand-made series WHEN its last game leaves it", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: "Souls",
			});
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				seriesId,
				seriesNumber: 1,
			});

			// Act
			await player.agent.put(customizeUrl(backlogGame.gameId)).send({
				imageId: null,
				endingType: EndingTypeEnum.STORY,
				series: { kind: SeriesChoiceKindEnum.NONE },
				seriesNumber: null,
			});

			// Assert
			expect(await selectBacklogRows.series(seriesId)).toBeNull();
		});

		it("SHOULD keep a series proposed by a game, even without backlog game", async () => {
			// Arrange
			// Une série proposée vient toujours d'IGDB
			const seriesId = await insertBacklogRows.series({
				name: "Halo",
				igdbCollectionId: await nextIgdbId(),
			});
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				proposedSeriesId: seriesId,
				seriesId,
				seriesNumber: 1,
			});

			// Act
			await player.agent.put(customizeUrl(backlogGame.gameId)).send({
				imageId: null,
				endingType: EndingTypeEnum.STORY,
				series: { kind: SeriesChoiceKindEnum.NONE },
				seriesNumber: null,
			});

			// Assert
			expect(await selectBacklogRows.series(seriesId)).not.toBeNull();
		});

		it("SHOULD move a main game with its sub-games WHEN its number changes", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: "Final Fantasy",
			});
			const main = await seedBacklogGame({
				userId: player.userId,
				seriesId,
				seriesNumber: 7,
			});
			const sub = await seedBacklogGame({
				userId: player.userId,
				seriesId,
				seriesNumber: 7.1,
			});

			// Act
			await player.agent.put(customizeUrl(main.gameId)).send({
				imageId: null,
				endingType: EndingTypeEnum.STORY,
				series: { kind: SeriesChoiceKindEnum.OTHER, seriesId },
				seriesNumber: 9,
			});

			// Assert
			expect(
				(await selectBacklogRows.userGame(player.userId, main.gameId))
					?.seriesNumber,
			).toBe(9);
			expect(
				(await selectBacklogRows.userGame(player.userId, sub.gameId))
					?.seriesNumber,
			).toBe(9.1);
		});
	});

	describe("ending type removed", () => {
		it("SHOULD remove the ending type WHEN no played version has a finished status", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				userVersionStatuses: [StatusEnum.STARTED, StatusEnum.ABANDONED],
			});

			// Act
			const response = await player.agent
				.put(customizeUrl(backlogGame.gameId))
				.send({
					imageId: null,
					endingType: null,
					series: { kind: SeriesChoiceKindEnum.NONE },
					seriesNumber: null,
				});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({ endingType: null });
			expect(
				(await selectBacklogRows.userGame(player.userId, backlogGame.gameId))
					?.endingType,
			).toBeNull();
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the game is not in the backlog, changing nothing, WHEN only another account has it", async () => {
			// Arrange
			const other = await openSignedInAgent();
			const othersGame = await seedBacklogGame({ userId: other.userId });
			const rowBefore = await selectBacklogRows.userGame(
				other.userId,
				othersGame.gameId,
			);

			// Act
			const response = await player.agent
				.put(customizeUrl(othersGame.gameId))
				.send({
					imageId: null,
					endingType: EndingTypeEnum.RUNS,
					series: { kind: SeriesChoiceKindEnum.NONE },
					seriesNumber: null,
				});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_GAME_NOT_FOUND,
				`No backlog game with id : ${othersGame.gameId}`,
			);
			expect(
				await selectBacklogRows.userGame(other.userId, othersGame.gameId),
			).toStrictEqual(rowBefore);
		});

		it("SHOULD answer that the game is not in the backlog", async () => {
			// Act
			const response = await player.agent
				.put(customizeUrl(NON_EXISTENT_ID))
				.send({
					imageId: null,
					endingType: EndingTypeEnum.STORY,
					series: { kind: SeriesChoiceKindEnum.NONE },
					seriesNumber: null,
				});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_GAME_NOT_FOUND,
				`No backlog game with id : ${NON_EXISTENT_ID}`,
			);
		});

		it("SHOULD refuse another series that does not exist", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
			});

			// Act
			const response = await player.agent
				.put(customizeUrl(backlogGame.gameId))
				.send({
					imageId: null,
					endingType: EndingTypeEnum.STORY,
					series: {
						kind: SeriesChoiceKindEnum.OTHER,
						seriesId: NON_EXISTENT_ID,
					},
					seriesNumber: null,
				});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.SERIES_NOT_FOUND,
				`No series with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse to remove the ending type, changing nothing, WHEN a played version has a finished status", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				userVersionStatuses: [StatusEnum.STARTED, StatusEnum.FINISHED],
			});

			// Act
			const response = await player.agent
				.put(customizeUrl(backlogGame.gameId))
				.send({
					imageId: null,
					endingType: null,
					series: { kind: SeriesChoiceKindEnum.NONE },
					seriesNumber: null,
				});

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.ENDING_TYPE_REQUIRED,
				`The ending type of game ${backlogGame.gameId} cannot be removed: a played version has a finished status`,
			);
			expect(
				(await selectBacklogRows.userGame(player.userId, backlogGame.gameId))
					?.endingType,
			).toBe(EndingTypeEnum.STORY);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).put(customizeUrl(1)).send({});

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

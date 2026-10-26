import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum.ts";
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

function customizeUrl(gameId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-games/${gameId}`;
}

describe("customizeUserGame", () => {
	describe("200 OK", () => {
		it("SHOULD save the new choices and convert the statuses the ending type no longer offers", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userVersionStatuses: [
					StatusEnum.FINISHED,
					StatusEnum.WATCHED,
					StatusEnum.PLATINUM,
				],
			});

			// Act
			const response = await request(app)
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
				(await selectBacklogRows.userVersions(backlogGame.gameId)).map(
					({ status }) => status,
				),
			).toStrictEqual([
				StatusEnum.DEEMED_FINISHED,
				StatusEnum.NOT_STARTED,
				StatusEnum.PLATINUM,
			]);
		});

		it("SHOULD remove a hand-made series WHEN its last game leaves it", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({ name: "Souls" });
			const backlogGame = await seedBacklogGame({ seriesId, seriesNumber: 1 });

			// Act
			await request(app)
				.put(customizeUrl(backlogGame.gameId))
				.send({
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
			const seriesId = await insertBacklogRows.series({ name: "Halo" });
			const backlogGame = await seedBacklogGame({
				proposedSeriesId: seriesId,
				seriesId,
				seriesNumber: 1,
			});

			// Act
			await request(app)
				.put(customizeUrl(backlogGame.gameId))
				.send({
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
				name: "Final Fantasy",
			});
			const main = await seedBacklogGame({ seriesId, seriesNumber: 7 });
			const sub = await seedBacklogGame({ seriesId, seriesNumber: 7.1 });

			// Act
			await request(app)
				.put(customizeUrl(main.gameId))
				.send({
					imageId: null,
					endingType: EndingTypeEnum.STORY,
					series: { kind: SeriesChoiceKindEnum.OTHER, seriesId },
					seriesNumber: 9,
				});

			// Assert
			expect(
				(await selectBacklogRows.userGame(main.gameId))?.seriesNumber,
			).toBe(9);
			expect((await selectBacklogRows.userGame(sub.gameId))?.seriesNumber).toBe(
				9.1,
			);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the game is not in the backlog", async () => {
			// Act
			const response = await request(app)
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
			const backlogGame = await seedBacklogGame();

			// Act
			const response = await request(app)
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
});

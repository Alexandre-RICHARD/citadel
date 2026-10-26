import type { StoredGameDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameDto.type.ts";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { SEEDED_PLATFORMS } from "../../../../testUtils/integration/backlog/seededPlatforms.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Game } from "../../models/Game.ts";

function storedGameUrl(gameId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/games/${gameId}`;
}

describe("getStoredGame", () => {
	describe("200 OK", () => {
		it("SHOULD give the game, its versions in release order with their emulators, and its DLC", async () => {
			// Arrange
			const stored = await seedStoredGame({
				name: "Final Fantasy X",
				otherVersionTitles: ["HD Remaster"],
				platformIds: [SEEDED_PLATFORMS.PS2],
				dlcNames: ["Eternal Calm"],
			});

			// Act
			const response = await request(app).get(storedGameUrl(stored.gameId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const game = response.body as StoredGameDto;
			expect(game).toMatchObject({
				id: stored.gameId,
				name: "Final Fantasy X",
				igdbUrl: `https://www.igdb.com/games/${stored.gameId}`,
				dlcs: [{ id: stored.dlcIds[0], name: "Eternal Calm" }],
				customization: null,
			});
			expect(game.versions.map(({ id }) => id)).toStrictEqual(
				stored.versionIds,
			);
			expect(
				game.versions[0]?.platformOptions.map(({ shortName }) => shortName),
			).toStrictEqual(["PS2", "PCSX2"]);
		});

		it("SHOULD give its customization WHEN the game is in the backlog", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				name: "Final Fantasy",
			});
			const stored = await seedStoredGame({ proposedSeriesId: seriesId });
			await insertBacklogRows.userGame({
				gameId: stored.gameId,
				imageId: "ar9",
				endingType: EndingTypeEnum.RUNS,
				seriesId,
				seriesNumber: 10.5,
			});

			// Act
			const response = await request(app).get(storedGameUrl(stored.gameId));

			// Assert
			expect((response.body as StoredGameDto).customization).toStrictEqual({
				imageId: "ar9",
				endingType: EndingTypeEnum.RUNS,
				series: { id: seriesId, name: "Final Fantasy" },
				seriesNumber: 10.5,
			});
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the game is not stored", async () => {
			// Act
			const response = await request(app).get(storedGameUrl(NON_EXISTENT_ID));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error and log it WHEN reading the game fails", async () => {
			// Arrange
			const stored = await seedStoredGame();
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app).get(storedGameUrl(stored.gameId));

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[GET ${storedGameUrl(stored.gameId)}] Failed to fetch stored game`,
			});
		});
	});
});

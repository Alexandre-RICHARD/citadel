import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Game } from "../../models/Game.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

function storedGameUrl(gameId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/games/${gameId}`;
}

describe("deleteStoredGame", () => {
	describe("204 No Content", () => {
		it("SHOULD delete the game with its versions, their platforms and its DLC, keeping its series", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				name: "IGDB series",
				igdbCollectionId: await nextIgdbId(),
			});
			const stored = await seedStoredGame({
				proposedSeriesId: seriesId,
				otherVersionTitles: ["HD Remaster"],
				dlcNames: ["Only DLC"],
			});

			// Act
			const response = await player.agent.delete(storedGameUrl(stored.gameId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(await Game.count({ where: { id: stored.gameId } })).toBe(0);
			expect(await selectBacklogRows.gameIds(stored.gameId)).toStrictEqual({
				versionIds: [],
				dlcIds: [],
			});
			expect(
				await selectBacklogRows.versionPlatformCount(stored.versionIds),
			).toBe(0);
			expect(await selectBacklogRows.series(seriesId)).not.toBeNull();
		});

		it("SHOULD leave the other games alone", async () => {
			// Arrange
			const deleted = await seedStoredGame();
			const kept = await seedStoredGame({ dlcNames: ["Kept DLC"] });

			// Act
			await player.agent.delete(storedGameUrl(deleted.gameId));

			// Assert
			expect(await selectBacklogRows.gameIds(kept.gameId)).toStrictEqual({
				versionIds: kept.versionIds,
				dlcIds: kept.dlcIds,
			});
			expect(
				await selectBacklogRows.versionPlatformCount(kept.versionIds),
			).toBe(1);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the game is not stored", async () => {
			// Act
			const response = await player.agent.delete(
				storedGameUrl(NON_EXISTENT_ID),
			);

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("409 Conflict", () => {
		it.each([{ owner: "the account itself" }, { owner: "another account" }])(
			"SHOULD refuse and delete nothing WHEN $owner has the game in its backlog",
			async ({ owner }) => {
				// Arrange
				const other = await openSignedInAgent();
				const backlogGame = await seedBacklogGame({
					userId: owner === "another account" ? other.userId : player.userId,
					dlcNames: ["Kept DLC"],
				});

				// Act
				const response = await player.agent.delete(
					storedGameUrl(backlogGame.gameId),
				);

				// Assert
				expectConflict(
					response,
					BacklogErrorCodeEnum.GAME_IN_A_BACKLOG,
					`Game is in a backlog : ${backlogGame.gameId}`,
				);
				expect(await Game.count({ where: { id: backlogGame.gameId } })).toBe(1);
				expect(
					await selectBacklogRows.gameIds(backlogGame.gameId),
				).toStrictEqual({
					versionIds: backlogGame.versionIds,
					dlcIds: backlogGame.dlcIds,
				});
			},
		);
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error, log it and delete nothing WHEN locking the game fails", async () => {
			// Arrange
			const stored = await seedStoredGame();
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await player.agent.delete(storedGameUrl(stored.gameId));

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[DELETE ${storedGameUrl(stored.gameId)}] Failed to lock game`,
			});
			expect(await Game.count({ where: { id: stored.gameId } })).toBe(1);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).delete(storedGameUrl(1));

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

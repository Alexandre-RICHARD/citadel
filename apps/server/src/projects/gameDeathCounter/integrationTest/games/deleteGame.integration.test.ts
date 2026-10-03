import { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { buildInvalidPathIdCases } from "../../../../testUtils/integration/buildInvalidPathIdCases.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { insertBossRow } from "../../../../testUtils/integration/gameDeathCounter/insertBossRow.ts";
import { insertDeathRow } from "../../../../testUtils/integration/gameDeathCounter/insertDeathRow.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { selectBossRow } from "../../../../testUtils/integration/gameDeathCounter/selectBossRow.ts";
import { selectDeathRow } from "../../../../testUtils/integration/gameDeathCounter/selectDeathRow.ts";
import { selectGameRow } from "../../../../testUtils/integration/gameDeathCounter/selectGameRow.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Game } from "../../models/Game.ts";

function deleteGameUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/${id}`;
}

describe("deleteGame", () => {
	describe("204 No Content", () => {
		it("SHOULD delete the game, its bosses and their deaths, with an empty response", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hollow Knight" });
			const hornetId = await insertBossRow({
				gameId,
				name: "Hornet",
				totalDeath: 1,
			});
			const hornetDeathId = await insertDeathRow({
				bossId: hornetId,
				date: new Date("2017-02-24T20:00:00.000Z"),
			});
			const radianceId = await insertBossRow({ gameId, name: "The Radiance" });

			// Act
			const response = await request(app).delete(deleteGameUrl(gameId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(response.text).toBe("");
			expect(await selectGameRow(gameId)).toBeNull();
			expect(await selectBossRow(hornetId)).toBeNull();
			expect(await selectBossRow(radianceId)).toBeNull();
			expect(await selectDeathRow(hornetDeathId)).toBeNull();
		});

		it("SHOULD not touch other games, their bosses or their deaths", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Sekiro: Shadows Die Twice" });
			const otherGameId = await insertGameRow({ name: "Elden Ring" });
			const otherBossId = await insertBossRow({
				gameId: otherGameId,
				name: "Godrick the Grafted",
				totalDeath: 1,
			});
			const otherDeathId = await insertDeathRow({
				bossId: otherBossId,
				date: new Date("2022-02-27T15:00:00.000Z"),
			});
			const otherGameRowBefore = await selectGameRow(otherGameId);
			const otherBossRowBefore = await selectBossRow(otherBossId);
			const otherDeathRowBefore = await selectDeathRow(otherDeathId);

			// Act
			await request(app).delete(deleteGameUrl(gameId));

			// Assert
			expect(await selectGameRow(otherGameId)).toStrictEqual(
				otherGameRowBefore,
			);
			expect(await selectBossRow(otherBossId)).toStrictEqual(
				otherBossRowBefore,
			);
			expect(await selectDeathRow(otherDeathId)).toStrictEqual(
				otherDeathRowBefore,
			);
		});
	});

	describe("400 Bad Request", () => {
		it.each(buildInvalidPathIdCases("ID"))(
			"SHOULD reject the request WHEN the id is $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app).delete(deleteGameUrl(pathValue));

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the game does not exist", async () => {
			// Act
			const response = await request(app).delete(
				deleteGameUrl(NON_EXISTENT_ID),
			);

			// Assert
			expectNotFound(
				response,
				GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${NON_EXISTENT_ID}`,
			);
		});

		it("SHOULD answer that the game no longer exists WHEN deleted twice", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Ghosts 'n Goblins" });
			await request(app).delete(deleteGameUrl(gameId));

			// Act
			const response = await request(app).delete(deleteGameUrl(gameId));

			// Assert
			expectNotFound(
				response,
				GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${gameId}`,
			);
		});
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error, log it and delete nothing WHEN the deletion fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Ninja Gaiden" });
			const bossId = await insertBossRow({ gameId, name: "Jaquio" });
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game, "destroy").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app).delete(deleteGameUrl(gameId));

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[DELETE ${deleteGameUrl(gameId)}] Failed to delete game`,
			});
			expect(await selectGameRow(gameId)).not.toBeNull();
			expect(await selectBossRow(bossId)).not.toBeNull();
		});
	});
});

import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type.ts";
import { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { buildInvalidBooleanCases } from "../../../../testUtils/integration/buildInvalidBooleanCases.ts";
import { buildInvalidPathIdCases } from "../../../../testUtils/integration/buildInvalidPathIdCases.ts";
import { expectDateBetween } from "../../../../testUtils/integration/expectDateBetween.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectMalformedJsonError } from "../../../../testUtils/integration/expectMalformedJsonError.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { failRawQueryOnce } from "../../../../testUtils/integration/failRawQueryOnce.ts";
import { insertBossRow } from "../../../../testUtils/integration/gameDeathCounter/insertBossRow.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { selectGameRow } from "../../../../testUtils/integration/gameDeathCounter/selectGameRow.ts";
import { MALFORMED_JSON_BODY } from "../../../../testUtils/integration/malformedJsonBody.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Game } from "../../models/Game.ts";

function setGameFinishedUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/${id}/finished`;
}

describe("setGameFinished", () => {
	describe("200 OK", () => {
		it("SHOULD finish the game now and return its summary", async () => {
			// Arrange
			const startedAt = new Date("2017-03-03T09:00:00.000Z");
			const gameId = await insertGameRow({
				name: "The Legend of Zelda: Breath of the Wild",
				createdAt: startedAt,
			});
			await insertBossRow({ gameId, name: "Calamity Ganon", totalDeath: 3 });

			// Act
			const requestStartedAt = new Date();
			const response = await request(app)
				.patch(setGameFinishedUrl(gameId))
				.send({ finished: true });
			const requestEndedAt = new Date();

			// Assert : réponse
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const gameDto = response.body as GameSummaryDto;
			expect(gameDto).toStrictEqual({
				id: gameId,
				name: "The Legend of Zelda: Breath of the Wild",
				startedAt: startedAt.toISOString(),
				endedAt: expect.any(String) as string,
				totalDeath: 3,
			});
			const endedAt = new Date(gameDto.endedAt ?? "");
			expectDateBetween(endedAt, requestStartedAt, requestEndedAt);

			// Assert : base
			expect((await selectGameRow(gameId))?.endedAt).toStrictEqual(endedAt);
		});

		it("SHOULD replace the end date with now WHEN the game was already finished", async () => {
			// Arrange
			const gameId = await insertGameRow({
				name: "Super Meat Boy",
				endedAt: new Date("2010-10-20T18:00:00.000Z"),
			});

			// Act
			const requestStartedAt = new Date();
			const response = await request(app)
				.patch(setGameFinishedUrl(gameId))
				.send({ finished: true });
			const requestEndedAt = new Date();

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const endedAt = (await selectGameRow(gameId))?.endedAt ?? new Date(0);
			expectDateBetween(endedAt, requestStartedAt, requestEndedAt);
			expect((response.body as GameSummaryDto).endedAt).toBe(
				endedAt.toISOString(),
			);
		});

		it("SHOULD reopen a finished game", async () => {
			// Arrange
			const gameId = await insertGameRow({
				name: "Enter the Gungeon",
				endedAt: new Date("2016-04-05T22:00:00.000Z"),
			});

			// Act
			const response = await request(app)
				.patch(setGameFinishedUrl(gameId))
				.send({ finished: false });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((response.body as GameSummaryDto).endedAt).toBeNull();
			expect((await selectGameRow(gameId))?.endedAt).toBeNull();
		});

		it("SHOULD leave open a game that was not finished, with a zero total WHEN it has no boss", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Cult of the Lamb" });

			// Act
			const response = await request(app)
				.patch(setGameFinishedUrl(gameId))
				.send({ finished: false });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({ endedAt: null, totalDeath: 0 });
			expect((await selectGameRow(gameId))?.endedAt).toBeNull();
		});

		it("SHOULD not change any other game", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Mortal Shell" });
			const otherGameId = await insertGameRow({ name: "Lords of the Fallen" });
			const otherGameRowBefore = await selectGameRow(otherGameId);

			// Act
			await request(app)
				.patch(setGameFinishedUrl(gameId))
				.send({ finished: true });

			// Assert
			expect(await selectGameRow(otherGameId)).toStrictEqual(
				otherGameRowBefore,
			);
		});
	});

	describe("400 Bad Request", () => {
		it.each(buildInvalidPathIdCases("ID"))(
			"SHOULD reject the request WHEN the id is $reason",
			async ({ pathValue, issue }) => {
				// Act
				const response = await request(app)
					.patch(setGameFinishedUrl(pathValue))
					.send({ finished: true });

				// Assert
				expectValidationError(response, [{ path: ["id"], ...issue }]);
			},
		);

		it.each(buildInvalidBooleanCases("Finished"))(
			"SHOULD reject the request without changing anything WHEN finished is $reason",
			async ({ value, issue }) => {
				// Arrange
				const gameId = await insertGameRow({ name: "Remnant II" });
				const gameRowBefore = await selectGameRow(gameId);

				// Act
				const response = await request(app)
					.patch(setGameFinishedUrl(gameId))
					.send({ finished: value });

				// Assert
				expectValidationError(response, [{ path: ["finished"], ...issue }]);
				expect(await selectGameRow(gameId)).toStrictEqual(gameRowBefore);
			},
		);

		it("SHOULD report both the invalid id and body, the id first", async () => {
			// Act
			const response = await request(app)
				.patch(setGameFinishedUrl("0"))
				.send({ finished: "yes" });

			// Assert
			expectValidationError(response, [
				{
					path: ["id"],
					code: ValidationIssueCodeEnum.TOO_SMALL,
					limit: 1,
					message: "ID should be at least 1",
				},
				{
					path: ["finished"],
					code: ValidationIssueCodeEnum.INVALID_TYPE,
					message: "Finished should be a boolean",
				},
			]);
		});

		it("SHOULD reject a malformed JSON without changing anything", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Darkest Dungeon" });
			const gameRowBefore = await selectGameRow(gameId);

			// Act
			const response = await request(app)
				.patch(setGameFinishedUrl(gameId))
				.set("Content-Type", "application/json")
				.send(MALFORMED_JSON_BODY);

			// Assert
			expectMalformedJsonError(response);
			expect(await selectGameRow(gameId)).toStrictEqual(gameRowBefore);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the game does not exist", async () => {
			// Act
			const response = await request(app)
				.patch(setGameFinishedUrl(NON_EXISTENT_ID))
				.send({ finished: true });

			// Assert
			expectNotFound(
				response,
				GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error, log it and change nothing WHEN reading the game fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Demon's Souls" });
			const gameRowBefore = await selectGameRow(gameId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.patch(setGameFinishedUrl(gameId))
				.send({ finished: true });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PATCH ${setGameFinishedUrl(gameId)}] Failed to update game end date`,
			});
			expect(await selectGameRow(gameId)).toStrictEqual(gameRowBefore);
		});

		it("SHOULD answer a generic error, log it and change nothing WHEN the update fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Wo Long: Fallen Dynasty" });
			const gameRowBefore = await selectGameRow(gameId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game.prototype, "update").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.patch(setGameFinishedUrl(gameId))
				.send({ finished: true });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PATCH ${setGameFinishedUrl(gameId)}] Failed to update game end date`,
			});
			expect(await selectGameRow(gameId)).toStrictEqual(gameRowBefore);
		});

		it("SHOULD answer a generic error but keep the end date WHEN computing the total fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Returnal" });
			const errorLogWatcher = await watchErrorLogs();
			failRawQueryOnce("SUM(total_death)");

			// Act
			const response = await request(app)
				.patch(setGameFinishedUrl(gameId))
				.send({ finished: true });

			// Assert : la mise à jour n'est pas annulée, seul le calcul du résumé a échoué
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PATCH ${setGameFinishedUrl(gameId)}] Failed to fetch total death for games`,
			});
			expect((await selectGameRow(gameId))?.endedAt).not.toBeNull();
		});
	});
});

import { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { buildInvalidBodyIdCases } from "../../../../testUtils/integration/buildInvalidBodyIdCases.ts";
import { buildInvalidPathIdCases } from "../../../../testUtils/integration/buildInvalidPathIdCases.ts";
import { expectDateBetween } from "../../../../testUtils/integration/expectDateBetween.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectMalformedJsonError } from "../../../../testUtils/integration/expectMalformedJsonError.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { failRawQueryOnce } from "../../../../testUtils/integration/failRawQueryOnce.ts";
import { insertBossRow } from "../../../../testUtils/integration/gameDeathCounter/insertBossRow.ts";
import { insertDeathRow } from "../../../../testUtils/integration/gameDeathCounter/insertDeathRow.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { INVALID_NAME_CASES } from "../../../../testUtils/integration/gameDeathCounter/invalidNameCases.ts";
import { selectBossRow } from "../../../../testUtils/integration/gameDeathCounter/selectBossRow.ts";
import { selectDeathRowsByBossId } from "../../../../testUtils/integration/gameDeathCounter/selectDeathRowsByBossId.ts";
import { MALFORMED_JSON_BODY } from "../../../../testUtils/integration/malformedJsonBody.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Boss } from "../../models/Boss.ts";
import { Game } from "../../models/Game.ts";

function updateBossUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/${id}`;
}

describe("updateBoss", () => {
	describe("200 OK", () => {
		it("SHOULD rename the boss and return its updated summary", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Dark Souls III" });
			const defeatedAt = new Date("2016-04-20T21:00:00.000Z");
			const bossId = await insertBossRow({
				gameId,
				name: "Pontiff",
				totalDeath: 2,
				defeatedAt,
			});
			const firstDeathDate = new Date("2016-04-20T19:00:00.000Z");
			await insertDeathRow({ bossId, date: firstDeathDate });
			await insertDeathRow({
				bossId,
				date: new Date("2016-04-20T20:00:00.000Z"),
			});
			const bossRowBefore = await selectBossRow(bossId);

			// Act
			const requestStartedAt = new Date();
			const response = await request(app)
				.put(updateBossUrl(bossId))
				.send({ name: "Pontiff Sulyvahn", gameId });
			const requestEndedAt = new Date();

			// Assert : réponse
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				id: bossId,
				name: "Pontiff Sulyvahn",
				firstTry: firstDeathDate.toISOString(),
				lastTry: defeatedAt.toISOString(),
				defeatedAt: defeatedAt.toISOString(),
				totalDeath: 2,
			});

			// Assert : base
			const bossRowAfter = await selectBossRow(bossId);
			expect(bossRowAfter).toStrictEqual({
				...bossRowBefore,
				name: "Pontiff Sulyvahn",
				updatedAt: expect.any(Date) as Date,
			});
			expectDateBetween(
				bossRowAfter?.updatedAt ?? new Date(0),
				requestStartedAt,
				requestEndedAt,
			);
		});

		it("SHOULD move the boss to another game, with its deaths", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Elden Ring" });
			const shadowOfTheErdtreeId = await insertGameRow({
				name: "Elden Ring: Shadow of the Erdtree",
			});
			const bossId = await insertBossRow({
				gameId,
				name: "Messmer the Impaler",
				totalDeath: 1,
			});
			await insertDeathRow({
				bossId,
				date: new Date("2024-06-22T20:00:00.000Z"),
			});
			const deathRowsBefore = await selectDeathRowsByBossId(bossId);

			// Act
			const response = await request(app)
				.put(updateBossUrl(bossId))
				.send({ name: "Messmer the Impaler", gameId: shadowOfTheErdtreeId });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((await selectBossRow(bossId))?.gameId).toBe(shadowOfTheErdtreeId);
			expect(await selectDeathRowsByBossId(bossId)).toStrictEqual(
				deathRowsBefore,
			);
		});

		it("SHOULD return empty tries WHEN the boss was never fought", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Bloodborne" });
			const bossId = await insertBossRow({ gameId, name: "Vicar Amelia" });

			// Act
			const response = await request(app)
				.put(updateBossUrl(bossId))
				.send({ name: "Vicar Amelia", gameId });

			// Assert
			expect(response.body).toMatchObject({
				firstTry: null,
				lastTry: null,
				defeatedAt: null,
				totalDeath: 0,
			});
		});

		it("SHOULD remove the spaces around the name and store intact a 255 characters name", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Cuphead" });
			const bossId = await insertBossRow({ gameId, name: "Grim" });
			const longestName = "Grim Matchstick ".repeat(16).slice(0, 255);

			// Act
			const response = await request(app)
				.put(updateBossUrl(bossId))
				.send({ name: `  ${longestName}\t`, gameId });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((await selectBossRow(bossId))?.name).toBe(longestName.trim());
		});

		it("SHOULD ignore unknown body fields, keeping the counter and the victory", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hollow Knight" });
			const bossId = await insertBossRow({
				gameId,
				name: "Nosk",
				totalDeath: 3,
			});

			// Act
			const response = await request(app).put(updateBossUrl(bossId)).send({
				name: "Nosk",
				gameId,
				totalDeath: 0,
				defeatedAt: "2017-03-01T00:00:00.000Z",
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(await selectBossRow(bossId)).toMatchObject({
				totalDeath: 3,
				defeatedAt: null,
			});
		});

		it("SHOULD not change any other boss", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Sekiro: Shadows Die Twice" });
			const bossId = await insertBossRow({ gameId, name: "Guardian Ape" });
			const otherBossId = await insertBossRow({
				gameId,
				name: "Lady Butterfly",
			});
			const otherBossRowBefore = await selectBossRow(otherBossId);

			// Act
			await request(app)
				.put(updateBossUrl(bossId))
				.send({ name: "Headless Ape", gameId });

			// Assert
			expect(await selectBossRow(otherBossId)).toStrictEqual(
				otherBossRowBefore,
			);
		});
	});

	describe("400 Bad Request", () => {
		it.each(buildInvalidPathIdCases("ID"))(
			"SHOULD reject the request WHEN the id is $reason",
			async ({ pathValue, message }) => {
				// Arrange
				const gameId = await insertGameRow({ name: "Dead Cells" });

				// Act
				const response = await request(app)
					.put(updateBossUrl(pathValue))
					.send({ name: "The Concierge", gameId });

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);

		it.each(INVALID_NAME_CASES)(
			"SHOULD reject the request without changing anything WHEN $reason",
			async ({ name, message }) => {
				// Arrange
				const gameId = await insertGameRow({ name: "Salt and Sanctuary" });
				const bossId = await insertBossRow({
					gameId,
					name: "The Nameless God",
				});
				const bossRowBefore = await selectBossRow(bossId);

				// Act
				const response = await request(app)
					.put(updateBossUrl(bossId))
					.send({ name, gameId });

				// Assert
				expectValidationError(response, [{ path: ["name"], message }]);
				expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
			},
		);

		it.each(buildInvalidBodyIdCases("Game ID"))(
			"SHOULD reject the request without changing anything WHEN the game id is $reason",
			async ({ value, message }) => {
				// Arrange
				const gameId = await insertGameRow({
					name: "Ori and the Blind Forest",
				});
				const bossId = await insertBossRow({ gameId, name: "Kuro" });
				const bossRowBefore = await selectBossRow(bossId);

				// Act
				const response = await request(app)
					.put(updateBossUrl(bossId))
					.send({ name: "Kuro", gameId: value });

				// Assert
				expectValidationError(response, [{ path: ["gameId"], message }]);
				expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
			},
		);

		it("SHOULD report every invalid field, the path id first", async () => {
			// Act
			const response = await request(app)
				.put(updateBossUrl("abc"))
				.send({ name: 4, gameId: "3" });

			// Assert
			expectValidationError(response, [
				{
					path: ["id"],
					message:
						"ID has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)",
				},
				{ path: ["name"], message: "Name should be a string" },
				{
					path: ["gameId"],
					message:
						'Game ID should be a JSON number, not text (e.g. 7, not "7")',
				},
			]);
		});

		it("SHOULD validate the body before looking for the boss and the game", async () => {
			// Act
			const response = await request(app)
				.put(updateBossUrl(NON_EXISTENT_ID))
				.send({ name: "", gameId: NON_EXISTENT_ID });

			// Assert
			expectValidationError(response, [
				{ path: ["name"], message: "Name should contain at least 1 character" },
			]);
		});

		it("SHOULD reject a malformed JSON without changing anything", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Shovel Knight" });
			const bossId = await insertBossRow({ gameId, name: "Black Knight" });
			const bossRowBefore = await selectBossRow(bossId);

			// Act
			const response = await request(app)
				.put(updateBossUrl(bossId))
				.set("Content-Type", "application/json")
				.send(MALFORMED_JSON_BODY);

			// Assert
			expectMalformedJsonError(response);
			expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the boss does not exist", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Furi" });

			// Act
			const response = await request(app)
				.put(updateBossUrl(NON_EXISTENT_ID))
				.send({ name: "The Chain", gameId });

			// Assert
			expectNotFound(
				response,
				GameDeathCounterErrorCodeEnum.BOSS_NOT_FOUND,
				`No boss with id : ${NON_EXISTENT_ID}`,
			);
		});

		it("SHOULD answer that the target game does not exist, changing nothing", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Lies of P" });
			const bossId = await insertBossRow({ gameId, name: "Parade Master" });
			const bossRowBefore = await selectBossRow(bossId);

			// Act
			const response = await request(app)
				.put(updateBossUrl(bossId))
				.send({ name: "Parade Master", gameId: NON_EXISTENT_ID });

			// Assert
			expectNotFound(
				response,
				GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${NON_EXISTENT_ID}`,
			);
			expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
		});

		it("SHOULD report the game first WHEN neither the boss nor the game exists", async () => {
			// Act
			const response = await request(app)
				.put(updateBossUrl(NON_EXISTENT_ID))
				.send({ name: "Ghost", gameId: NON_EXISTENT_ID });

			// Assert
			expectNotFound(
				response,
				GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error, log it and change nothing WHEN checking the game fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Demon's Souls" });
			const bossId = await insertBossRow({ gameId, name: "Flamelurker" });
			const bossRowBefore = await selectBossRow(bossId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game, "count").mockRejectedValueOnce(simulatedDatabaseFailure());

			// Act
			const response = await request(app)
				.put(updateBossUrl(bossId))
				.send({ name: "Maneater", gameId });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PUT ${updateBossUrl(bossId)}] Failed to check game existence`,
			});
			expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
		});

		it("SHOULD answer a generic error, log it and change nothing WHEN reading the boss fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Nioh 2" });
			const bossId = await insertBossRow({ gameId, name: "Otakemaru" });
			const bossRowBefore = await selectBossRow(bossId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Boss, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.put(updateBossUrl(bossId))
				.send({ name: "Otakemaru, Ogre King", gameId });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PUT ${updateBossUrl(bossId)}] Failed to update boss`,
			});
			expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
		});

		it("SHOULD answer a generic error, log it and change nothing WHEN the update fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Wo Long: Fallen Dynasty" });
			const bossId = await insertBossRow({ gameId, name: "Lu Bu" });
			const bossRowBefore = await selectBossRow(bossId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Boss.prototype, "update").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.put(updateBossUrl(bossId))
				.send({ name: "Lu Bu, the Flying General", gameId });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PUT ${updateBossUrl(bossId)}] Failed to update boss`,
			});
			expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
		});

		it("SHOULD answer a generic error but keep the change WHEN computing the tries fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Blasphemous II" });
			const bossId = await insertBossRow({ gameId, name: "Eviterno" });
			const errorLogWatcher = await watchErrorLogs();
			failRawQueryOnce("MIN(date)");

			// Act
			const response = await request(app)
				.put(updateBossUrl(bossId))
				.send({ name: "Eviterno, First of the Penitents", gameId });

			// Assert : la mise à jour n'est pas annulée, seul le calcul du résumé a échoué
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PUT ${updateBossUrl(bossId)}] Failed to fetch death date range for bosses`,
			});
			expect((await selectBossRow(bossId))?.name).toBe(
				"Eviterno, First of the Penitents",
			);
		});
	});
});

import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

import { app } from "../../../../app.ts";
import { buildInvalidPathIdCases } from "../../../../testUtils/integration/buildInvalidPathIdCases.ts";
import { expectDateBetween } from "../../../../testUtils/integration/expectDateBetween.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectMalformedJsonError } from "../../../../testUtils/integration/expectMalformedJsonError.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { failRawQueryOnce } from "../../../../testUtils/integration/failRawQueryOnce.ts";
import { insertBossRow } from "../../../../testUtils/integration/gameDeathCounter/insertBossRow.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { INVALID_NAME_CASES } from "../../../../testUtils/integration/gameDeathCounter/invalidNameCases.ts";
import { selectGameRow } from "../../../../testUtils/integration/gameDeathCounter/selectGameRow.ts";
import { MALFORMED_JSON_BODY } from "../../../../testUtils/integration/malformedJsonBody.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Game } from "../../models/Game.ts";

const UPDATE_GAME_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:id`;

function updateGameUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/${id}`;
}

describe(`PUT ${UPDATE_GAME_URL}`, () => {
	describe("200", () => {
		test("renomme le jeu et renvoie son résumé à jour", async () => {
			// Arrange
			const startedAt = new Date("2011-09-22T08:00:00.000Z");
			const endedAt = new Date("2011-12-24T23:00:00.000Z");
			const gameId = await insertGameRow({
				name: "Dark Souls",
				createdAt: startedAt,
				endedAt,
			});
			await insertBossRow({ gameId, name: "Bell Gargoyles", totalDeath: 4 });
			await insertBossRow({ gameId, name: "Capra Demon", totalDeath: 6 });
			const gameRowBefore = await selectGameRow(gameId);

			// Act
			const requestStartedAt = new Date();
			const response = await request(app)
				.put(updateGameUrl(gameId))
				.send({ name: "Dark Souls Remastered" });
			const requestEndedAt = new Date();

			// Assert : réponse
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				id: gameId,
				name: "Dark Souls Remastered",
				startedAt: startedAt.toISOString(),
				endedAt: endedAt.toISOString(),
				totalDeath: 10,
			});

			// Assert : base
			const gameRowAfter = await selectGameRow(gameId);
			expect(gameRowAfter).toStrictEqual({
				...gameRowBefore,
				name: "Dark Souls Remastered",
				updatedAt: expect.any(Date) as Date,
			});
			expectDateBetween(
				gameRowAfter?.updatedAt ?? new Date(0),
				requestStartedAt,
				requestEndedAt,
			);
		});

		test("renvoie un total à zéro pour un jeu sans boss", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Celest" });

			// Act
			const response = await request(app)
				.put(updateGameUrl(gameId))
				.send({ name: "Celeste" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((response.body as GameSummaryDto).totalDeath).toBe(0);
		});

		test("ne modifie aucun autre jeu", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hollow Knight" });
			const otherGameId = await insertGameRow({ name: "Hollow Knight" });
			const otherGameRowBefore = await selectGameRow(otherGameId);

			// Act
			await request(app)
				.put(updateGameUrl(gameId))
				.send({ name: "Hollow Knight: Godmaster" });

			// Assert
			expect(await selectGameRow(otherGameId)).toStrictEqual(
				otherGameRowBefore,
			);
		});

		test("accepte de garder le même nom", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Cuphead" });

			// Act
			const response = await request(app)
				.put(updateGameUrl(gameId))
				.send({ name: "Cuphead" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((response.body as GameSummaryDto).name).toBe("Cuphead");
			expect((await selectGameRow(gameId))?.name).toBe("Cuphead");
		});

		test("retire les espaces autour du nom", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hades" });

			// Act
			const response = await request(app)
				.put(updateGameUrl(gameId))
				.send({ name: "\t Hades II  " });

			// Assert
			expect((response.body as GameSummaryDto).name).toBe("Hades II");
			expect((await selectGameRow(gameId))?.name).toBe("Hades II");
		});

		test("stocke intact un nom de 255 caractères, le maximum de la colonne", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Ori" });
			const longestName = "Ori and the Will of the Wisps "
				.repeat(9)
				.slice(0, 255);

			// Act
			const response = await request(app)
				.put(updateGameUrl(gameId))
				.send({ name: longestName });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((await selectGameRow(gameId))?.name).toBe(longestName);
		});

		test("ignore les champs inconnus du corps, dont la date de fin et l'id", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Blasphemous" });
			const otherGameId = await insertGameRow({ name: "Blasphemous II" });
			const otherGameRowBefore = await selectGameRow(otherGameId);

			// Act
			const response = await request(app).put(updateGameUrl(gameId)).send({
				name: "Blasphemous: The Stir of Dawn",
				id: otherGameId,
				endedAt: "2019-09-10T00:00:00.000Z",
				totalDeath: 666,
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({
				id: gameId,
				endedAt: null,
				totalDeath: 0,
			});
			expect((await selectGameRow(gameId))?.endedAt).toBeNull();
			expect(await selectGameRow(otherGameId)).toStrictEqual(
				otherGameRowBefore,
			);
		});
	});

	describe("400", () => {
		test.each(buildInvalidPathIdCases("ID"))(
			"refuse un id qui est $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app)
					.put(updateGameUrl(pathValue))
					.send({ name: "Dead Cells" });

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);

		test.each(INVALID_NAME_CASES)(
			"refuse la requête quand $reason, sans rien modifier",
			async ({ name, message }) => {
				// Arrange
				const gameId = await insertGameRow({ name: "Salt and Sanctuary" });
				const gameRowBefore = await selectGameRow(gameId);

				// Act
				const response = await request(app)
					.put(updateGameUrl(gameId))
					.send({ name });

				// Assert
				expectValidationError(response, [{ path: ["name"], message }]);
				expect(await selectGameRow(gameId)).toStrictEqual(gameRowBefore);
			},
		);

		test("signale à la fois l'id et le corps invalides, l'id en premier", async () => {
			// Act
			const response = await request(app)
				.put(updateGameUrl("abc"))
				.send({ name: "" });

			// Assert
			expectValidationError(response, [
				{ path: ["id"], message: "ID should be a number" },
				{ path: ["name"], message: "Name should contain at least 1 character" },
			]);
		});

		test("valide le corps avant de chercher le jeu", async () => {
			// Act
			const response = await request(app)
				.put(updateGameUrl(NON_EXISTENT_ID))
				.send({ name: 7 });

			// Assert
			expectValidationError(response, [
				{ path: ["name"], message: "Name should be a string" },
			]);
		});

		test("refuse un JSON malformé, sans rien modifier", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Shovel Knight" });
			const gameRowBefore = await selectGameRow(gameId);

			// Act
			const response = await request(app)
				.put(updateGameUrl(gameId))
				.set("Content-Type", "application/json")
				.send(MALFORMED_JSON_BODY);

			// Assert
			expectMalformedJsonError(response);
			expect(await selectGameRow(gameId)).toStrictEqual(gameRowBefore);
		});
	});

	describe("404", () => {
		test("répond que le jeu n'existe pas", async () => {
			// Act
			const response = await request(app)
				.put(updateGameUrl(NON_EXISTENT_ID))
				.send({ name: "Mega Man 2" });

			// Assert
			expectNotFound(response, `No game with id : ${NON_EXISTENT_ID}`);
		});
	});

	describe("500", () => {
		test("répond une erreur générique et la journalise quand la lecture du jeu échoue, sans rien modifier", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Furi" });
			const gameRowBefore = await selectGameRow(gameId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.put(updateGameUrl(gameId))
				.send({ name: "Furi: One More Fight" });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PUT ${updateGameUrl(gameId)}] Failed to update game`,
			});
			expect(await selectGameRow(gameId)).toStrictEqual(gameRowBefore);
		});

		test("répond une erreur générique et la journalise quand l'écriture échoue, sans rien modifier", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Sifu" });
			const gameRowBefore = await selectGameRow(gameId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game.prototype, "update").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.put(updateGameUrl(gameId))
				.send({ name: "Sifu: Arenas" });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PUT ${updateGameUrl(gameId)}] Failed to update game`,
			});
			expect(await selectGameRow(gameId)).toStrictEqual(gameRowBefore);
		});

		test("répond une erreur générique quand le calcul du total échoue, mais le nouveau nom reste enregistré", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Nioh" });
			const errorLogWatcher = await watchErrorLogs();
			failRawQueryOnce("SUM(total_death)");

			// Act
			const response = await request(app)
				.put(updateGameUrl(gameId))
				.send({ name: "Nioh 2" });

			// Assert : la mise à jour n'est pas annulée, seul le calcul du résumé a échoué
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PUT ${updateGameUrl(gameId)}] Failed to fetch total death for games`,
			});
			expect((await selectGameRow(gameId))?.name).toBe("Nioh 2");
		});
	});
});

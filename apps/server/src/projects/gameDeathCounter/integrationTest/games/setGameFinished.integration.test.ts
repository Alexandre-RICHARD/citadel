import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

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

const SET_GAME_FINISHED_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:id/finished`;

function setGameFinishedUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/${id}/finished`;
}

describe(`PATCH ${SET_GAME_FINISHED_URL}`, () => {
	describe("200", () => {
		test("termine le jeu maintenant et renvoie son résumé", async () => {
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

		test("remplace la date de fin d'un jeu déjà terminé par maintenant", async () => {
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

		test("rouvre un jeu terminé", async () => {
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

		test("laisse ouvert un jeu qui n'était pas terminé, avec un total à zéro sans boss", async () => {
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

		test("ne modifie aucun autre jeu", async () => {
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

	describe("400", () => {
		test.each(buildInvalidPathIdCases("ID"))(
			"refuse un id qui est $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app)
					.patch(setGameFinishedUrl(pathValue))
					.send({ finished: true });

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);

		test.each(buildInvalidBooleanCases("Finished"))(
			"refuse un statut terminé qui est $reason, sans rien modifier",
			async ({ value, message }) => {
				// Arrange
				const gameId = await insertGameRow({ name: "Remnant II" });
				const gameRowBefore = await selectGameRow(gameId);

				// Act
				const response = await request(app)
					.patch(setGameFinishedUrl(gameId))
					.send({ finished: value });

				// Assert
				expectValidationError(response, [{ path: ["finished"], message }]);
				expect(await selectGameRow(gameId)).toStrictEqual(gameRowBefore);
			},
		);

		test("signale à la fois l'id et le corps invalides, l'id en premier", async () => {
			// Act
			const response = await request(app)
				.patch(setGameFinishedUrl("0"))
				.send({ finished: "yes" });

			// Assert
			expectValidationError(response, [
				{ path: ["id"], message: "ID should be at least 1" },
				{ path: ["finished"], message: "Finished should be a boolean" },
			]);
		});

		test("refuse un JSON malformé, sans rien modifier", async () => {
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

	describe("404", () => {
		test("répond que le jeu n'existe pas", async () => {
			// Act
			const response = await request(app)
				.patch(setGameFinishedUrl(NON_EXISTENT_ID))
				.send({ finished: true });

			// Assert
			expectNotFound(response, `No game with id : ${NON_EXISTENT_ID}`);
		});
	});

	describe("500", () => {
		test("répond une erreur générique et la journalise quand la lecture du jeu échoue, sans rien modifier", async () => {
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

		test("répond une erreur générique et la journalise quand l'écriture échoue, sans rien modifier", async () => {
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

		test("répond une erreur générique quand le calcul du total échoue, mais la date de fin reste enregistrée", async () => {
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

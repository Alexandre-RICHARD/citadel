import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type.ts";
import type { CreateGameBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameBodyDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

import { app } from "../../../../app.ts";
import { countTableRows } from "../../../../testUtils/integration/countTableRows.ts";
import { expectDateBetween } from "../../../../testUtils/integration/expectDateBetween.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectMalformedJsonError } from "../../../../testUtils/integration/expectMalformedJsonError.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { INVALID_NAME_CASES } from "../../../../testUtils/integration/gameDeathCounter/invalidNameCases.ts";
import { selectGameRow } from "../../../../testUtils/integration/gameDeathCounter/selectGameRow.ts";
import { MALFORMED_JSON_BODY } from "../../../../testUtils/integration/malformedJsonBody.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Game } from "../../models/Game.ts";

const CREATE_GAME_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games`;

describe(`POST ${CREATE_GAME_URL}`, () => {
	describe("201", () => {
		test("crée le jeu en base et le renvoie", async () => {
			// Arrange
			const createGameBody: CreateGameBodyDto = { name: "Hollow Knight" };

			// Act
			const requestStartedAt = new Date();
			const response = await request(app)
				.post(CREATE_GAME_URL)
				.send(createGameBody);
			const requestEndedAt = new Date();

			// Assert : réponse
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const gameDto = response.body as GameSummaryDto;
			expect(gameDto).toStrictEqual({
				id: expect.any(Number) as number,
				name: "Hollow Knight",
				startedAt: expect.any(String) as string,
				endedAt: null,
				totalDeath: 0,
			});
			const startedAt = new Date(gameDto.startedAt);
			expect(startedAt.toISOString()).toBe(gameDto.startedAt);
			expectDateBetween(startedAt, requestStartedAt, requestEndedAt);

			// Assert : base
			expect(await selectGameRow(gameDto.id)).toStrictEqual({
				id: gameDto.id,
				name: "Hollow Knight",
				endedAt: null,
				createdAt: startedAt,
				updatedAt: startedAt,
			});
		});

		test("retire les espaces autour du nom", async () => {
			// Act
			const response = await request(app)
				.post(CREATE_GAME_URL)
				.send({ name: "   Elden Ring \t " });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const gameDto = response.body as GameSummaryDto;
			expect(gameDto.name).toBe("Elden Ring");
			expect((await selectGameRow(gameDto.id))?.name).toBe("Elden Ring");
		});

		test("stocke intact un nom de 255 caractères, le maximum de la colonne", async () => {
			// Arrange
			const longestName = "Sekiro: Shadows Die Twice - "
				.repeat(10)
				.slice(0, 255);

			// Act
			const response = await request(app)
				.post(CREATE_GAME_URL)
				.send({ name: longestName });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const gameDto = response.body as GameSummaryDto;
			expect(gameDto.name).toBe(longestName);
			expect((await selectGameRow(gameDto.id))?.name).toBe(longestName);
		});

		test("mesure la longueur du nom après avoir retiré les espaces autour", async () => {
			// Arrange
			const longestName = "Bloodborne ".repeat(24).slice(0, 255);

			// Act
			const response = await request(app)
				.post(CREATE_GAME_URL)
				.send({ name: `   ${longestName}   ` });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect((response.body as GameSummaryDto).name).toBe(longestName.trim());
		});

		test("conserve les accents, idéogrammes et emojis", async () => {
			// Arrange
			const unicodeName = "Ōkami — 大神 🐺";

			// Act
			const response = await request(app)
				.post(CREATE_GAME_URL)
				.send({ name: unicodeName });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const gameDto = response.body as GameSummaryDto;
			expect(gameDto.name).toBe(unicodeName);
			expect((await selectGameRow(gameDto.id))?.name).toBe(unicodeName);
		});

		test("accepte deux jeux du même nom", async () => {
			// Act
			const firstResponse = await request(app)
				.post(CREATE_GAME_URL)
				.send({ name: "Celeste" });
			const secondResponse = await request(app)
				.post(CREATE_GAME_URL)
				.send({ name: "Celeste" });

			// Assert
			expect(firstResponse.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect(secondResponse.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const firstGameId = (firstResponse.body as GameSummaryDto).id;
			const secondGameId = (secondResponse.body as GameSummaryDto).id;
			expect(secondGameId).not.toBe(firstGameId);
			expect((await selectGameRow(firstGameId))?.name).toBe("Celeste");
			expect((await selectGameRow(secondGameId))?.name).toBe("Celeste");
		});

		test("ignore les champs inconnus du corps, dont ceux qui imitent le résultat", async () => {
			// Arrange
			const existingGameId = await insertGameRow({ name: "Hades II" });
			const existingGameRow = await selectGameRow(existingGameId);

			// Act
			const response = await request(app).post(CREATE_GAME_URL).send({
				name: "Hades",
				id: existingGameId,
				totalDeath: 999,
				endedAt: "2020-09-17T00:00:00.000Z",
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const gameDto = response.body as GameSummaryDto;
			expect(gameDto.id).not.toBe(existingGameId);
			expect(gameDto.totalDeath).toBe(0);
			expect(gameDto.endedAt).toBeNull();
			expect((await selectGameRow(gameDto.id))?.endedAt).toBeNull();
			expect(await selectGameRow(existingGameId)).toStrictEqual(
				existingGameRow,
			);
		});
	});

	describe("400", () => {
		test.each(INVALID_NAME_CASES)(
			"refuse la requête quand $reason, sans rien créer",
			async ({ name, message }) => {
				// Arrange
				const gameCountBefore = await countTableRows("game");

				// Act
				const response = await request(app)
					.post(CREATE_GAME_URL)
					.send({ name });

				// Assert
				expectValidationError(response, [{ path: ["name"], message }]);
				expect(await countTableRows("game")).toBe(gameCountBefore);
			},
		);

		test("refuse un corps absent", async () => {
			// Arrange
			const gameCountBefore = await countTableRows("game");

			// Act
			const response = await request(app).post(CREATE_GAME_URL);

			// Assert
			expectValidationError(response, [
				{
					path: [],
					message: "Invalid input: expected object, received undefined",
				},
			]);
			expect(await countTableRows("game")).toBe(gameCountBefore);
		});

		test("refuse un corps qui est un tableau", async () => {
			// Arrange
			const gameCountBefore = await countTableRows("game");

			// Act
			const response = await request(app)
				.post(CREATE_GAME_URL)
				.send([{ name: "Cuphead" }]);

			// Assert
			expectValidationError(response, [
				{
					path: [],
					message: "Invalid input: expected object, received array",
				},
			]);
			expect(await countTableRows("game")).toBe(gameCountBefore);
		});

		test("refuse un JSON malformé", async () => {
			// Arrange
			const gameCountBefore = await countTableRows("game");

			// Act
			const response = await request(app)
				.post(CREATE_GAME_URL)
				.set("Content-Type", "application/json")
				.send(MALFORMED_JSON_BODY);

			// Assert
			expectMalformedJsonError(response);
			expect(await countTableRows("game")).toBe(gameCountBefore);
		});
	});

	describe("500", () => {
		test("répond une erreur générique et la journalise quand l'insertion échoue", async () => {
			// Arrange
			vi.spyOn(Game, "create").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);
			const errorLogWatcher = await watchErrorLogs();
			const gameCountBefore = await countTableRows("game");

			// Act
			const response = await request(app)
				.post(CREATE_GAME_URL)
				.send({ name: "Lies of P" });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[POST ${CREATE_GAME_URL}] Failed to insert new game`,
			});
			expect(await countTableRows("game")).toBe(gameCountBefore);
		});
	});
});

import type { BossSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossSummaryDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

import { app } from "../../../../app.ts";
import { buildInvalidPathIdCases } from "../../../../testUtils/integration/buildInvalidPathIdCases.ts";
import { countTableRows } from "../../../../testUtils/integration/countTableRows.ts";
import { expectDateBetween } from "../../../../testUtils/integration/expectDateBetween.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectMalformedJsonError } from "../../../../testUtils/integration/expectMalformedJsonError.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { INVALID_NAME_CASES } from "../../../../testUtils/integration/gameDeathCounter/invalidNameCases.ts";
import { selectBossRow } from "../../../../testUtils/integration/gameDeathCounter/selectBossRow.ts";
import { MALFORMED_JSON_BODY } from "../../../../testUtils/integration/malformedJsonBody.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Boss } from "../../models/Boss.ts";
import { Game } from "../../models/Game.ts";

const CREATE_BOSS_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:gameId/bosses`;

function createBossUrl(gameId: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/${gameId}/bosses`;
}

describe(`POST ${CREATE_BOSS_URL}`, () => {
	describe("201", () => {
		test("crée le boss dans le jeu et renvoie son résumé", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hollow Knight" });

			// Act
			const requestStartedAt = new Date();
			const response = await request(app)
				.post(createBossUrl(gameId))
				.send({ name: "Mantis Lords" });
			const requestEndedAt = new Date();

			// Assert : réponse
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const bossDto = response.body as BossSummaryDto;
			expect(bossDto).toStrictEqual({
				id: expect.any(Number) as number,
				name: "Mantis Lords",
				firstTry: null,
				lastTry: null,
				defeatedAt: null,
				totalDeath: 0,
			});

			// Assert : base
			const bossRow = await selectBossRow(bossDto.id);
			expect(bossRow).toStrictEqual({
				id: bossDto.id,
				gameId,
				name: "Mantis Lords",
				defeatedAt: null,
				totalDeath: 0,
				createdAt: expect.any(Date) as Date,
				updatedAt: expect.any(Date) as Date,
			});
			expectDateBetween(
				bossRow?.createdAt ?? new Date(0),
				requestStartedAt,
				requestEndedAt,
			);
		});

		test("retire les espaces autour du nom", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Elden Ring" });

			// Act
			const response = await request(app)
				.post(createBossUrl(gameId))
				.send({ name: "  Rennala, Queen of the Full Moon\n" });

			// Assert
			const bossDto = response.body as BossSummaryDto;
			expect(bossDto.name).toBe("Rennala, Queen of the Full Moon");
			expect((await selectBossRow(bossDto.id))?.name).toBe(
				"Rennala, Queen of the Full Moon",
			);
		});

		test("stocke intact un nom de 255 caractères, le maximum de la colonne", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Dark Souls II" });
			const longestName = "The Smelter Demon, ".repeat(14).slice(0, 255);

			// Act
			const response = await request(app)
				.post(createBossUrl(gameId))
				.send({ name: longestName });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const bossDto = response.body as BossSummaryDto;
			expect((await selectBossRow(bossDto.id))?.name).toBe(longestName);
		});

		test("conserve les accents, idéogrammes et emojis", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Ōkami" });
			const unicodeName = "Orochi, le serpent à huit têtes 八岐大蛇 🐍";

			// Act
			const response = await request(app)
				.post(createBossUrl(gameId))
				.send({ name: unicodeName });

			// Assert
			const bossDto = response.body as BossSummaryDto;
			expect(bossDto.name).toBe(unicodeName);
			expect((await selectBossRow(bossDto.id))?.name).toBe(unicodeName);
		});

		test("accepte deux boss du même nom dans le même jeu", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Dark Souls III" });

			// Act
			const firstResponse = await request(app)
				.post(createBossUrl(gameId))
				.send({ name: "Lothric, Younger Prince" });
			const secondResponse = await request(app)
				.post(createBossUrl(gameId))
				.send({ name: "Lothric, Younger Prince" });

			// Assert
			expect(firstResponse.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect(secondResponse.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect((secondResponse.body as BossSummaryDto).id).not.toBe(
				(firstResponse.body as BossSummaryDto).id,
			);
		});

		test("accepte un boss dans un jeu déjà terminé", async () => {
			// Arrange
			const gameId = await insertGameRow({
				name: "Celeste",
				endedAt: new Date("2018-02-10T20:00:00.000Z"),
			});

			// Act
			const response = await request(app)
				.post(createBossUrl(gameId))
				.send({ name: "Badeline" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
		});

		test("rattache le boss au jeu du chemin et ignore les champs inconnus du corps", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hades" });
			const otherGameId = await insertGameRow({ name: "Hades II" });

			// Act
			const response = await request(app).post(createBossUrl(gameId)).send({
				name: "Megaera",
				gameId: otherGameId,
				totalDeath: 50,
				defeatedAt: "2020-09-17T00:00:00.000Z",
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const bossDto = response.body as BossSummaryDto;
			expect(bossDto).toMatchObject({ totalDeath: 0, defeatedAt: null });
			expect(await selectBossRow(bossDto.id)).toMatchObject({
				gameId,
				totalDeath: 0,
				defeatedAt: null,
			});
		});
	});

	describe("400", () => {
		test.each(buildInvalidPathIdCases("Game ID"))(
			"refuse un id de jeu qui est $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app)
					.post(createBossUrl(pathValue))
					.send({ name: "False Knight" });

				// Assert
				expectValidationError(response, [{ path: ["gameId"], message }]);
			},
		);

		test.each(INVALID_NAME_CASES)(
			"refuse la requête quand $reason, sans rien créer",
			async ({ name, message }) => {
				// Arrange
				const gameId = await insertGameRow({ name: "Blasphemous" });
				const bossCountBefore = await countTableRows("boss");

				// Act
				const response = await request(app)
					.post(createBossUrl(gameId))
					.send({ name });

				// Assert
				expectValidationError(response, [{ path: ["name"], message }]);
				expect(await countTableRows("boss")).toBe(bossCountBefore);
			},
		);

		test("signale à la fois l'id de jeu et le corps invalides, l'id en premier", async () => {
			// Act
			const response = await request(app)
				.post(createBossUrl("1.5"))
				.send({ name: null });

			// Assert
			expectValidationError(response, [
				{
					path: ["gameId"],
					message:
						"Game ID has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)",
				},
				{ path: ["name"], message: "Name should be a string" },
			]);
		});

		test("valide le corps avant de chercher le jeu", async () => {
			// Act
			const response = await request(app)
				.post(createBossUrl(NON_EXISTENT_ID))
				.send({ name: "" });

			// Assert
			expectValidationError(response, [
				{ path: ["name"], message: "Name should contain at least 1 character" },
			]);
		});

		test("refuse un JSON malformé, sans rien créer", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Shovel Knight" });
			const bossCountBefore = await countTableRows("boss");

			// Act
			const response = await request(app)
				.post(createBossUrl(gameId))
				.set("Content-Type", "application/json")
				.send(MALFORMED_JSON_BODY);

			// Assert
			expectMalformedJsonError(response);
			expect(await countTableRows("boss")).toBe(bossCountBefore);
		});
	});

	describe("404", () => {
		test("répond que le jeu n'existe pas, sans rien créer", async () => {
			// Arrange
			const bossCountBefore = await countTableRows("boss");

			// Act
			const response = await request(app)
				.post(createBossUrl(NON_EXISTENT_ID))
				.send({ name: "Specter Knight" });

			// Assert
			expectNotFound(response, `No game with id : ${NON_EXISTENT_ID}`);
			expect(await countTableRows("boss")).toBe(bossCountBefore);
		});
	});

	describe("500", () => {
		test("répond une erreur générique et la journalise quand la vérification du jeu échoue, sans rien créer", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Nine Sols" });
			const bossCountBefore = await countTableRows("boss");
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game, "count").mockRejectedValueOnce(simulatedDatabaseFailure());

			// Act
			const response = await request(app)
				.post(createBossUrl(gameId))
				.send({ name: "Yingzhao" });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[POST ${createBossUrl(gameId)}] Failed to check game existence`,
			});
			expect(await countTableRows("boss")).toBe(bossCountBefore);
		});

		test("répond une erreur générique et la journalise quand l'insertion échoue, sans rien créer", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Ender Magnolia" });
			const bossCountBefore = await countTableRows("boss");
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Boss, "create").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.post(createBossUrl(gameId))
				.send({ name: "Nola" });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[POST ${createBossUrl(gameId)}] Failed to insert new boss`,
			});
			expect(await countTableRows("boss")).toBe(bossCountBefore);
		});
	});
});

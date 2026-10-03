import type { GameDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameDto.type.ts";
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
import { failRawQueryOnce } from "../../../../testUtils/integration/failRawQueryOnce.ts";
import { insertBossRow } from "../../../../testUtils/integration/gameDeathCounter/insertBossRow.ts";
import { insertDeathRow } from "../../../../testUtils/integration/gameDeathCounter/insertDeathRow.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Game } from "../../models/Game.ts";

function getOneGameUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/${id}`;
}

async function getOneGame(id: number): Promise<GameDto> {
	const response = await request(app).get(getOneGameUrl(id));
	expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
	return response.body as GameDto;
}

describe("getOneGame", () => {
	describe("200 OK", () => {
		it("SHOULD return the game, its boss summaries and the total of deaths", async () => {
			// Arrange
			const startedAt = new Date("2022-02-25T00:00:00.000Z");
			const gameId = await insertGameRow({
				name: "Elden Ring",
				createdAt: startedAt,
			});

			const margitDefeatedAt = new Date("2022-02-26T21:00:00.000Z");
			const margitId = await insertBossRow({
				gameId,
				name: "Margit, the Fell Omen",
				totalDeath: 2,
				defeatedAt: margitDefeatedAt,
				createdAt: new Date("2022-02-26T18:00:00.000Z"),
			});
			const margitFirstDeath = new Date("2022-02-26T19:30:00.000Z");
			await insertDeathRow({ bossId: margitId, date: margitFirstDeath });
			await insertDeathRow({
				bossId: margitId,
				date: new Date("2022-02-26T20:10:00.000Z"),
			});

			const maleniaId = await insertBossRow({
				gameId,
				name: "Malenia, Blade of Miquella",
				totalDeath: 3,
				createdAt: new Date("2022-04-01T18:00:00.000Z"),
			});
			const maleniaFirstDeath = new Date("2022-04-01T19:00:00.000Z");
			const maleniaLastDeath = new Date("2022-04-03T23:59:59.999Z");
			await insertDeathRow({ bossId: maleniaId, date: maleniaLastDeath });
			await insertDeathRow({ bossId: maleniaId, date: maleniaFirstDeath });
			await insertDeathRow({
				bossId: maleniaId,
				date: new Date("2022-04-02T12:00:00.000Z"),
			});

			const radahnId = await insertBossRow({
				gameId,
				name: "Starscourge Radahn",
				createdAt: new Date("2022-04-10T18:00:00.000Z"),
			});

			// Act
			const gameDto = await getOneGame(gameId);

			// Assert
			expect(gameDto).toStrictEqual({
				id: gameId,
				name: "Elden Ring",
				startedAt: startedAt.toISOString(),
				endedAt: null,
				totalDeath: 5,
				bosses: [
					{
						id: margitId,
						name: "Margit, the Fell Omen",
						firstTry: margitFirstDeath.toISOString(),
						lastTry: margitDefeatedAt.toISOString(),
						defeatedAt: margitDefeatedAt.toISOString(),
						totalDeath: 2,
					},
					{
						id: maleniaId,
						name: "Malenia, Blade of Miquella",
						firstTry: maleniaFirstDeath.toISOString(),
						lastTry: maleniaLastDeath.toISOString(),
						defeatedAt: null,
						totalDeath: 3,
					},
					{
						id: radahnId,
						name: "Starscourge Radahn",
						firstTry: null,
						lastTry: null,
						defeatedAt: null,
						totalDeath: 0,
					},
				],
			});
		});

		it("SHOULD return an empty list and a zero total WHEN the finished game has no boss", async () => {
			// Arrange
			const startedAt = new Date("2025-09-04T16:00:00.000Z");
			const endedAt = new Date("2025-10-12T22:30:00.000Z");
			const gameId = await insertGameRow({
				name: "Hollow Knight: Silksong",
				createdAt: startedAt,
				endedAt,
			});

			// Act
			const gameDto = await getOneGame(gameId);

			// Assert
			expect(gameDto).toStrictEqual({
				id: gameId,
				name: "Hollow Knight: Silksong",
				startedAt: startedAt.toISOString(),
				endedAt: endedAt.toISOString(),
				totalDeath: 0,
				bosses: [],
			});
		});

		it("SHOULD sort the bosses by creation date, then by id WHEN dates are equal", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Bloodborne" });
			const sameCreationDate = new Date("2015-03-24T20:00:00.000Z");
			const gascoigneId = await insertBossRow({
				gameId,
				name: "Father Gascoigne",
				createdAt: sameCreationDate,
			});
			const clericBeastId = await insertBossRow({
				gameId,
				name: "Cleric Beast",
				createdAt: new Date("2015-03-24T19:00:00.000Z"),
			});
			const ludwigId = await insertBossRow({
				gameId,
				name: "Ludwig, the Accursed",
				createdAt: sameCreationDate,
			});

			// Act
			const gameDto = await getOneGame(gameId);

			// Assert
			expect(gameDto.bosses.map((boss) => boss.id)).toStrictEqual([
				clericBeastId,
				gascoigneId,
				ludwigId,
			]);
		});

		it("SHOULD compute first and last try from deaths and victory date", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Dark Souls III" });

			const gundyrDefeatedAt = new Date("2016-04-12T18:00:00.000Z");
			await insertBossRow({
				gameId,
				name: "Iudex Gundyr",
				defeatedAt: gundyrDefeatedAt,
				createdAt: new Date("2016-04-12T17:00:00.000Z"),
			});

			const namelessKingId = await insertBossRow({
				gameId,
				name: "Nameless King",
				totalDeath: 2,
				defeatedAt: new Date("2016-05-01T20:00:00.000Z"),
				createdAt: new Date("2016-05-01T17:00:00.000Z"),
			});
			const namelessKingFirstDeath = new Date("2016-05-01T19:00:00.000Z");
			const deathAfterVictory = new Date("2016-05-02T10:00:00.000Z");
			await insertDeathRow({
				bossId: namelessKingId,
				date: namelessKingFirstDeath,
			});
			await insertDeathRow({ bossId: namelessKingId, date: deathAfterVictory });

			const gaelDefeatedAt = new Date("2017-03-28T20:00:00.000Z");
			const gaelId = await insertBossRow({
				gameId,
				name: "Slave Knight Gael",
				totalDeath: 1,
				defeatedAt: gaelDefeatedAt,
				createdAt: new Date("2017-03-28T17:00:00.000Z"),
			});
			const deathAfterGaelVictory = new Date("2017-03-29T09:00:00.000Z");
			await insertDeathRow({ bossId: gaelId, date: deathAfterGaelVictory });

			// Act
			const gameDto = await getOneGame(gameId);

			// Assert
			const tries = gameDto.bosses.map(({ name, firstTry, lastTry }) => ({
				name,
				firstTry,
				lastTry,
			}));
			expect(tries).toStrictEqual([
				{
					name: "Iudex Gundyr",
					firstTry: gundyrDefeatedAt.toISOString(),
					lastTry: gundyrDefeatedAt.toISOString(),
				},
				{
					name: "Nameless King",
					firstTry: namelessKingFirstDeath.toISOString(),
					lastTry: deathAfterVictory.toISOString(),
				},
				{
					name: "Slave Knight Gael",
					firstTry: gaelDefeatedAt.toISOString(),
					lastTry: deathAfterGaelVictory.toISOString(),
				},
			]);
		});

		it("SHOULD sum the boss counters WHEN they differ from the number of recorded deaths", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Nine Sols" });
			const bossId = await insertBossRow({
				gameId,
				name: "Eigong",
				totalDeath: 9,
			});
			await insertDeathRow({
				bossId,
				date: new Date("2024-05-29T21:00:00.000Z"),
			});

			// Act
			const gameDto = await getOneGame(gameId);

			// Assert
			expect(gameDto.totalDeath).toBe(9);
			expect(gameDto.bosses[0]?.totalDeath).toBe(9);
		});

		it("SHOULD only return the bosses of this game", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hades" });
			const megaeraId = await insertBossRow({ gameId, name: "Megaera" });
			const otherGameId = await insertGameRow({ name: "Hades II" });
			await insertBossRow({ gameId: otherGameId, name: "Chronos" });

			// Act
			const gameDto = await getOneGame(gameId);

			// Assert
			expect(gameDto.bosses.map((boss) => boss.id)).toStrictEqual([megaeraId]);
		});
	});

	describe("400 Bad Request", () => {
		it.each(buildInvalidPathIdCases("ID"))(
			"SHOULD reject the request WHEN the id is $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app).get(getOneGameUrl(pathValue));

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the game does not exist", async () => {
			// Act
			const response = await request(app).get(getOneGameUrl(NON_EXISTENT_ID));

			// Assert
			expectNotFound(
				response,
				GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error and log it WHEN reading the game fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Lies of P" });
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app).get(getOneGameUrl(gameId));

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[GET ${getOneGameUrl(gameId)}] Failed to fetch game with bosses`,
			});
		});

		it("SHOULD answer a generic error and log it WHEN computing the tries fails", async () => {
			// Arrange : sans boss, le calcul des essais n'est jamais lancé
			const gameId = await insertGameRow({ name: "Ender Lilies" });
			await insertBossRow({ gameId, name: "Ulv, the Mad Knight" });
			const errorLogWatcher = await watchErrorLogs();
			failRawQueryOnce("MIN(date)");

			// Act
			const response = await request(app).get(getOneGameUrl(gameId));

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[GET ${getOneGameUrl(gameId)}] Failed to fetch death date range for bosses`,
			});
		});
	});
});

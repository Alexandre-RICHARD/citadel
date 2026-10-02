import type { BossDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

import { app } from "../../../../app.ts";
import { buildInvalidPathIdCases } from "../../../../testUtils/integration/buildInvalidPathIdCases.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { insertBossRow } from "../../../../testUtils/integration/gameDeathCounter/insertBossRow.ts";
import { insertDeathRow } from "../../../../testUtils/integration/gameDeathCounter/insertDeathRow.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Boss } from "../../models/Boss.ts";

const GET_ONE_BOSS_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:id`;

function getOneBossUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/${id}`;
}

async function getOneBoss(id: number): Promise<BossDto> {
	const response = await request(app).get(getOneBossUrl(id));
	expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
	return response.body as BossDto;
}

describe(`GET ${GET_ONE_BOSS_URL}`, () => {
	describe("200", () => {
		test("renvoie le boss et ses morts triées par date, puis par id à date égale", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Sekiro: Shadows Die Twice" });
			const defeatedAt = new Date("2019-04-02T23:00:00.000Z");
			const bossId = await insertBossRow({
				gameId,
				name: "Genichiro Ashina",
				totalDeath: 4,
				defeatedAt,
			});
			const firstDeathDate = new Date("2019-03-31T20:00:00.000Z");
			const sameDate = new Date("2019-04-01T21:30:00.000Z");
			const lastDeathDate = new Date("2019-04-02T22:45:00.000Z");
			const lastDeathId = await insertDeathRow({
				bossId,
				date: lastDeathDate,
				comment: "Presque, il restait un coup",
			});
			const sameDateFirstId = await insertDeathRow({
				bossId,
				date: sameDate,
			});
			const firstDeathId = await insertDeathRow({
				bossId,
				date: firstDeathDate,
				comment: "Premier essai, découverte de la foudre",
			});
			const sameDateSecondId = await insertDeathRow({
				bossId,
				date: sameDate,
				comment: "Même minute, deuxième chute",
			});

			// Act
			const bossDto = await getOneBoss(bossId);

			// Assert
			expect(bossDto).toStrictEqual({
				id: bossId,
				name: "Genichiro Ashina",
				firstTry: firstDeathDate.toISOString(),
				lastTry: defeatedAt.toISOString(),
				defeatedAt: defeatedAt.toISOString(),
				totalDeath: 4,
				deaths: [
					{
						id: firstDeathId,
						date: firstDeathDate.toISOString(),
						comment: "Premier essai, découverte de la foudre",
					},
					{ id: sameDateFirstId, date: sameDate.toISOString(), comment: null },
					{
						id: sameDateSecondId,
						date: sameDate.toISOString(),
						comment: "Même minute, deuxième chute",
					},
					{
						id: lastDeathId,
						date: lastDeathDate.toISOString(),
						comment: "Presque, il restait un coup",
					},
				],
			});
		});

		test("renvoie un boss jamais affronté avec des essais vides", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Elden Ring" });
			const bossId = await insertBossRow({
				gameId,
				name: "Mohg, Lord of Blood",
			});

			// Act
			const bossDto = await getOneBoss(bossId);

			// Assert
			expect(bossDto).toStrictEqual({
				id: bossId,
				name: "Mohg, Lord of Blood",
				firstTry: null,
				lastTry: null,
				defeatedAt: null,
				totalDeath: 0,
				deaths: [],
			});
		});

		test("prend la date de victoire comme premier et dernier essai d'un boss vaincu sans mourir", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Dark Souls" });
			const defeatedAt = new Date("2011-10-01T19:00:00.000Z");
			const bossId = await insertBossRow({
				gameId,
				name: "Asylum Demon",
				defeatedAt,
			});

			// Act
			const bossDto = await getOneBoss(bossId);

			// Assert
			expect(bossDto).toMatchObject({
				firstTry: defeatedAt.toISOString(),
				lastTry: defeatedAt.toISOString(),
				deaths: [],
			});
		});

		test("garde comme dernier essai une mort enregistrée après la victoire", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Bloodborne" });
			const bossId = await insertBossRow({
				gameId,
				name: "Orphan of Kos",
				totalDeath: 1,
				defeatedAt: new Date("2015-11-24T20:00:00.000Z"),
			});
			const deathAfterVictory = new Date("2015-11-25T09:00:00.000Z");
			await insertDeathRow({ bossId, date: deathAfterVictory });

			// Act
			const bossDto = await getOneBoss(bossId);

			// Assert
			expect(bossDto.lastTry).toBe(deathAfterVictory.toISOString());
		});

		test("renvoie le compteur du boss, même s'il diffère du nombre de morts enregistrées", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Lies of P" });
			const bossId = await insertBossRow({
				gameId,
				name: "Laxasia the Complete",
				totalDeath: 23,
			});
			await insertDeathRow({
				bossId,
				date: new Date("2023-09-25T21:00:00.000Z"),
			});

			// Act
			const bossDto = await getOneBoss(bossId);

			// Assert
			expect(bossDto.totalDeath).toBe(23);
			expect(bossDto.deaths).toHaveLength(1);
		});

		test("ne renvoie que les morts de ce boss", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Cuphead" });
			const bossId = await insertBossRow({ gameId, name: "King Dice" });
			const deathId = await insertDeathRow({
				bossId,
				date: new Date("2017-10-01T18:00:00.000Z"),
			});
			const otherBossId = await insertBossRow({ gameId, name: "The Devil" });
			await insertDeathRow({
				bossId: otherBossId,
				date: new Date("2017-10-02T18:00:00.000Z"),
			});

			// Act
			const bossDto = await getOneBoss(bossId);

			// Assert
			expect(bossDto.deaths.map((death) => death.id)).toStrictEqual([deathId]);
		});
	});

	describe("400", () => {
		test.each(buildInvalidPathIdCases("ID"))(
			"refuse un id qui est $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app).get(getOneBossUrl(pathValue));

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);
	});

	describe("404", () => {
		test("répond que le boss n'existe pas", async () => {
			// Act
			const response = await request(app).get(getOneBossUrl(NON_EXISTENT_ID));

			// Assert
			expectNotFound(response, `No boss with id : ${NON_EXISTENT_ID}`);
		});
	});

	describe("500", () => {
		test("répond une erreur générique et la journalise quand la lecture du boss échoue", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hades" });
			const bossId = await insertBossRow({ gameId, name: "Theseus" });
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Boss, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app).get(getOneBossUrl(bossId));

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[GET ${getOneBossUrl(bossId)}] Failed to fetch boss with deaths`,
			});
		});
	});
});

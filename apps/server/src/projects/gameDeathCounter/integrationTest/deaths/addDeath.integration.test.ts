import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/deathDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

import { app } from "../../../../app.ts";
import { buildInvalidPathIdCases } from "../../../../testUtils/integration/buildInvalidPathIdCases.ts";
import { countTableRows } from "../../../../testUtils/integration/countTableRows.ts";
import { expectDateBetween } from "../../../../testUtils/integration/expectDateBetween.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { insertBossRow } from "../../../../testUtils/integration/gameDeathCounter/insertBossRow.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { selectBossRow } from "../../../../testUtils/integration/gameDeathCounter/selectBossRow.ts";
import { selectDeathRow } from "../../../../testUtils/integration/gameDeathCounter/selectDeathRow.ts";
import { selectDeathRowsByBossId } from "../../../../testUtils/integration/gameDeathCounter/selectDeathRowsByBossId.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";

const ADD_DEATH_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:bossId/deaths`;

function addDeathUrl(bossId: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/${bossId}/deaths`;
}

describe(`POST ${ADD_DEATH_URL}`, () => {
	describe("201", () => {
		test("enregistre une mort datée de maintenant et incrémente le compteur du boss", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Elden Ring" });
			const bossId = await insertBossRow({
				gameId,
				name: "Maliketh, the Black Blade",
				totalDeath: 3,
			});

			// Act
			const requestStartedAt = new Date();
			const response = await request(app).post(addDeathUrl(bossId));
			const requestEndedAt = new Date();

			// Assert : réponse
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const deathDto = response.body as DeathDto;
			expect(deathDto).toStrictEqual({
				id: expect.any(Number) as number,
				date: expect.any(String) as string,
				comment: null,
			});
			const date = new Date(deathDto.date);
			expectDateBetween(date, requestStartedAt, requestEndedAt);

			// Assert : base
			expect(await selectDeathRow(deathDto.id)).toStrictEqual({
				id: deathDto.id,
				bossId,
				date,
				comment: null,
				createdAt: expect.any(Date) as Date,
				updatedAt: expect.any(Date) as Date,
			});
			expect((await selectBossRow(bossId))?.totalDeath).toBe(4);
		});

		test("incrémente à chaque mort ajoutée", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Cuphead" });
			const bossId = await insertBossRow({ gameId, name: "Dr. Kahl's Robot" });

			// Act
			await request(app).post(addDeathUrl(bossId));
			await request(app).post(addDeathUrl(bossId));
			await request(app).post(addDeathUrl(bossId));

			// Assert
			expect((await selectBossRow(bossId))?.totalDeath).toBe(3);
			expect(await selectDeathRowsByBossId(bossId)).toHaveLength(3);
		});

		test("compte toutes les morts envoyées en même temps", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Celeste" });
			const bossId = await insertBossRow({ gameId, name: "Badeline" });

			// Act
			const responses = await Promise.all(
				Array.from({ length: 5 }, () => request(app).post(addDeathUrl(bossId))),
			);

			// Assert
			expect(responses.map((response) => response.status)).toStrictEqual(
				Array<number>(5).fill(HttpStatutCodeSuccessEnum.CREATED),
			);
			expect((await selectBossRow(bossId))?.totalDeath).toBe(5);
			expect(await selectDeathRowsByBossId(bossId)).toHaveLength(5);
		});

		test("accepte une mort sur un boss déjà vaincu", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Dark Souls" });
			const bossId = await insertBossRow({
				gameId,
				name: "Gwyn, Lord of Cinder",
				defeatedAt: new Date("2011-12-20T22:00:00.000Z"),
			});

			// Act
			const response = await request(app).post(addDeathUrl(bossId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect((await selectBossRow(bossId))?.totalDeath).toBe(1);
		});

		test("ignore un corps envoyé : la date est maintenant et le commentaire vide", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hades" });
			const bossId = await insertBossRow({
				gameId,
				name: "Hades, Lord of the Dead",
			});

			// Act
			const response = await request(app).post(addDeathUrl(bossId)).send({
				date: "2020-09-17T20:00:00.000Z",
				comment: "Le père, encore",
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const deathDto = response.body as DeathDto;
			expect(deathDto.comment).toBeNull();
			expect(deathDto.date).not.toBe("2020-09-17T20:00:00.000Z");
		});

		test("n'incrémente que le compteur du boss visé", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hollow Knight" });
			const bossId = await insertBossRow({ gameId, name: "Grimm" });
			const otherBossId = await insertBossRow({
				gameId,
				name: "Nightmare King Grimm",
				totalDeath: 40,
			});
			const otherBossRowBefore = await selectBossRow(otherBossId);

			// Act
			await request(app).post(addDeathUrl(bossId));

			// Assert
			expect(await selectBossRow(otherBossId)).toStrictEqual(
				otherBossRowBefore,
			);
		});
	});

	describe("400", () => {
		test.each(buildInvalidPathIdCases("Boss ID"))(
			"refuse un id de boss qui est $reason",
			async ({ pathValue, message }) => {
				// Arrange
				const deathCountBefore = await countTableRows("death");

				// Act
				const response = await request(app).post(addDeathUrl(pathValue));

				// Assert
				expectValidationError(response, [{ path: ["bossId"], message }]);
				expect(await countTableRows("death")).toBe(deathCountBefore);
			},
		);
	});

	describe("404", () => {
		test("répond que le boss n'existe pas, sans rien créer", async () => {
			// Arrange
			const deathCountBefore = await countTableRows("death");

			// Act
			const response = await request(app).post(addDeathUrl(NON_EXISTENT_ID));

			// Assert
			expectNotFound(response, `No boss with id : ${NON_EXISTENT_ID}`);
			expect(await countTableRows("death")).toBe(deathCountBefore);
		});
	});

	describe("500", () => {
		test("répond une erreur générique et la journalise quand la lecture verrouillée du boss échoue, sans rien créer", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Lies of P" });
			const bossId = await insertBossRow({ gameId, name: "Nameless Puppet" });
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Boss, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app).post(addDeathUrl(bossId));

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[POST ${addDeathUrl(bossId)}] Failed to add death`,
			});
			expect(await selectDeathRowsByBossId(bossId)).toStrictEqual([]);
			expect((await selectBossRow(bossId))?.totalDeath).toBe(0);
		});

		test("répond une erreur générique et la journalise quand l'insertion de la mort échoue, sans toucher au compteur", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Bloodborne" });
			const bossId = await insertBossRow({
				gameId,
				name: "Ludwig, the Holy Blade",
				totalDeath: 6,
			});
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Death, "create").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app).post(addDeathUrl(bossId));

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[POST ${addDeathUrl(bossId)}] Failed to add death`,
			});
			expect(await selectDeathRowsByBossId(bossId)).toStrictEqual([]);
			expect((await selectBossRow(bossId))?.totalDeath).toBe(6);
		});

		test("annule la mort déjà insérée quand l'incrément du compteur échoue", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Sekiro: Shadows Die Twice" });
			const bossId = await insertBossRow({
				gameId,
				name: "Demon of Hatred",
				totalDeath: 11,
			});
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Boss, "increment").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app).post(addDeathUrl(bossId));

			// Assert : la transaction est annulée, la mort insérée juste avant disparaît
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[POST ${addDeathUrl(bossId)}] Failed to add death`,
			});
			expect(await selectDeathRowsByBossId(bossId)).toStrictEqual([]);
			expect((await selectBossRow(bossId))?.totalDeath).toBe(11);
		});
	});
});

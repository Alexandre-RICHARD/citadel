import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
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
import { selectBossRow } from "../../../../testUtils/integration/gameDeathCounter/selectBossRow.ts";
import { selectDeathRow } from "../../../../testUtils/integration/gameDeathCounter/selectDeathRow.ts";
import { selectDeathRowsByBossId } from "../../../../testUtils/integration/gameDeathCounter/selectDeathRowsByBossId.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";

const DELETE_DEATH_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/deaths/:id`;

function deleteDeathUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/deaths/${id}`;
}

describe(`DELETE ${DELETE_DEATH_URL}`, () => {
	describe("204", () => {
		test("supprime la mort et décrémente le compteur du boss, sans corps de réponse", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Elden Ring" });
			const bossId = await insertBossRow({
				gameId,
				name: "Placidusax",
				totalDeath: 2,
			});
			const deathId = await insertDeathRow({
				bossId,
				date: new Date("2022-05-10T20:00:00.000Z"),
			});
			const otherDeathId = await insertDeathRow({
				bossId,
				date: new Date("2022-05-10T20:20:00.000Z"),
			});
			const otherDeathRowBefore = await selectDeathRow(otherDeathId);

			// Act
			const response = await request(app).delete(deleteDeathUrl(deathId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(response.text).toBe("");
			expect(await selectDeathRow(deathId)).toBeNull();
			expect((await selectBossRow(bossId))?.totalDeath).toBe(1);
			expect(await selectDeathRow(otherDeathId)).toStrictEqual(
				otherDeathRowBefore,
			);
		});

		test("ne fait jamais passer le compteur sous zéro", async () => {
			// Arrange : compteur déjà à zéro alors qu'une mort existe, état incohérent possible en base
			const gameId = await insertGameRow({ name: "Hollow Knight" });
			const bossId = await insertBossRow({
				gameId,
				name: "Lost Kin",
				totalDeath: 0,
			});
			const deathId = await insertDeathRow({
				bossId,
				date: new Date("2017-03-10T20:00:00.000Z"),
			});

			// Act
			const response = await request(app).delete(deleteDeathUrl(deathId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(await selectDeathRow(deathId)).toBeNull();
			expect((await selectBossRow(bossId))?.totalDeath).toBe(0);
		});

		test("ne décrémente qu'une fois quand la même mort est supprimée deux fois en même temps", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Cuphead" });
			const bossId = await insertBossRow({
				gameId,
				name: "Beppi the Clown",
				totalDeath: 4,
			});
			const deathId = await insertDeathRow({
				bossId,
				date: new Date("2017-10-08T18:00:00.000Z"),
			});

			// Act
			const responses = await Promise.all([
				request(app).delete(deleteDeathUrl(deathId)),
				request(app).delete(deleteDeathUrl(deathId)),
			]);

			// Assert
			expect(responses.map((response) => response.status).sort()).toStrictEqual(
				[
					HttpStatutCodeSuccessEnum.NO_CONTENT,
					HttpStatutCodeErrorEnum.NOT_FOUND,
				],
			);
			expect((await selectBossRow(bossId))?.totalDeath).toBe(3);
		});

		test("garde un compteur exact quand des ajouts et des suppressions se croisent sur le même boss", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hollow Knight" });
			const bossId = await insertBossRow({
				gameId,
				name: "Pure Vessel",
				totalDeath: 3,
			});
			const deathIds = await Promise.all(
				[
					"2017-08-24T20:00:00.000Z",
					"2017-08-24T20:10:00.000Z",
					"2017-08-24T20:20:00.000Z",
				].map((date) => insertDeathRow({ bossId, date: new Date(date) })),
			);
			const addDeathUrl = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/${bossId}/deaths`;

			// Act : deux suppressions et trois ajouts envoyés ensemble
			const responses = await Promise.all([
				request(app).delete(deleteDeathUrl(deathIds[0] ?? 0)),
				request(app).post(addDeathUrl),
				request(app).delete(deleteDeathUrl(deathIds[1] ?? 0)),
				request(app).post(addDeathUrl),
				request(app).post(addDeathUrl),
			]);

			// Assert : 3 - 2 + 3
			expect(responses.map((response) => response.status)).toStrictEqual([
				HttpStatutCodeSuccessEnum.NO_CONTENT,
				HttpStatutCodeSuccessEnum.CREATED,
				HttpStatutCodeSuccessEnum.NO_CONTENT,
				HttpStatutCodeSuccessEnum.CREATED,
				HttpStatutCodeSuccessEnum.CREATED,
			]);
			expect((await selectBossRow(bossId))?.totalDeath).toBe(4);
			expect(await selectDeathRowsByBossId(bossId)).toHaveLength(4);
		});
	});

	describe("400", () => {
		test.each(buildInvalidPathIdCases("ID"))(
			"refuse un id qui est $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app).delete(deleteDeathUrl(pathValue));

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);
	});

	describe("404", () => {
		test("répond que la mort n'existe pas", async () => {
			// Act
			const response = await request(app).delete(
				deleteDeathUrl(NON_EXISTENT_ID),
			);

			// Assert
			expectNotFound(response, `No death with id : ${NON_EXISTENT_ID}`);
		});

		test("répond que la mort n'existe plus à la deuxième suppression, sans décrémenter à nouveau", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Dark Souls III" });
			const bossId = await insertBossRow({
				gameId,
				name: "Sister Friede",
				totalDeath: 5,
			});
			const deathId = await insertDeathRow({
				bossId,
				date: new Date("2016-10-25T21:00:00.000Z"),
			});
			await request(app).delete(deleteDeathUrl(deathId));

			// Act
			const response = await request(app).delete(deleteDeathUrl(deathId));

			// Assert
			expectNotFound(response, `No death with id : ${deathId}`);
			expect((await selectBossRow(bossId))?.totalDeath).toBe(4);
		});
	});

	describe("500", () => {
		test.each([
			{
				step: "la lecture de la mort",
				failStep: () =>
					vi
						.spyOn(Death, "findByPk")
						.mockRejectedValueOnce(simulatedDatabaseFailure()),
			},
			{
				step: "la suppression de la mort",
				failStep: () =>
					vi
						.spyOn(Death, "destroy")
						.mockRejectedValueOnce(simulatedDatabaseFailure()),
			},
			{
				step: "la décrémentation du compteur",
				failStep: () =>
					vi
						.spyOn(Boss, "decrement")
						.mockRejectedValueOnce(simulatedDatabaseFailure()),
			},
		])(
			"répond une erreur générique et la journalise quand $step échoue, sans rien supprimer ni décrémenter",
			async ({ failStep }) => {
				// Arrange
				const gameId = await insertGameRow({ name: "Bloodborne" });
				const bossId = await insertBossRow({
					gameId,
					name: "Martyr Logarius",
					totalDeath: 7,
				});
				const deathId = await insertDeathRow({
					bossId,
					date: new Date("2015-04-02T20:00:00.000Z"),
				});
				const deathRowBefore = await selectDeathRow(deathId);
				const errorLogWatcher = await watchErrorLogs();
				failStep();

				// Act
				const response = await request(app).delete(deleteDeathUrl(deathId));

				// Assert : tout se fait dans une transaction, annulée en bloc
				expectInternalServerError(response);
				await errorLogWatcher.expectLogged({
					errorType: "DatabaseError",
					message: `[DELETE ${deleteDeathUrl(deathId)}] Failed to delete death`,
				});
				expect(await selectDeathRow(deathId)).toStrictEqual(deathRowBefore);
				expect((await selectBossRow(bossId))?.totalDeath).toBe(7);
			},
		);
	});
});

import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

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

function deleteDeathUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/deaths/${id}`;
}

describe("deleteDeath", () => {
	describe("204 No Content", () => {
		it("SHOULD delete the death and decrement the boss counter, with an empty response", async () => {
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

		it("SHOULD never bring the counter below zero", async () => {
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

		it("SHOULD decrement only once WHEN the same death is deleted twice at the same time", async () => {
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

		it("SHOULD keep an exact counter WHEN additions and deletions cross on the same boss", async () => {
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

	describe("400 Bad Request", () => {
		it.each(buildInvalidPathIdCases("ID"))(
			"SHOULD reject the request WHEN the id is $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app).delete(deleteDeathUrl(pathValue));

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the death does not exist", async () => {
			// Act
			const response = await request(app).delete(
				deleteDeathUrl(NON_EXISTENT_ID),
			);

			// Assert
			expectNotFound(response, `No death with id : ${NON_EXISTENT_ID}`);
		});

		it("SHOULD answer that the death no longer exists without decrementing again WHEN deleted twice", async () => {
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

	describe("500 Internal Server Error", () => {
		it.each([
			{
				step: "reading the death",
				failStep: () =>
					vi
						.spyOn(Death, "findByPk")
						.mockRejectedValueOnce(simulatedDatabaseFailure()),
			},
			{
				step: "deleting the death",
				failStep: () =>
					vi
						.spyOn(Death, "destroy")
						.mockRejectedValueOnce(simulatedDatabaseFailure()),
			},
			{
				step: "decrementing the counter",
				failStep: () =>
					vi
						.spyOn(Boss, "decrement")
						.mockRejectedValueOnce(simulatedDatabaseFailure()),
			},
		])(
			"SHOULD answer a generic error, log it and change nothing WHEN $step fails",
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

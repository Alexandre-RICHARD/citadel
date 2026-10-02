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
import { selectBossRow } from "../../../../testUtils/integration/gameDeathCounter/selectBossRow.ts";
import { selectDeathRow } from "../../../../testUtils/integration/gameDeathCounter/selectDeathRow.ts";
import { selectGameRow } from "../../../../testUtils/integration/gameDeathCounter/selectGameRow.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Boss } from "../../models/Boss.ts";

const DELETE_BOSS_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:id`;

function deleteBossUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/${id}`;
}

describe(`DELETE ${DELETE_BOSS_URL}`, () => {
	describe("204", () => {
		test("supprime le boss et ses morts, sans corps de réponse", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Dark Souls" });
			const bossId = await insertBossRow({
				gameId,
				name: "Bed of Chaos",
				totalDeath: 2,
			});
			const firstDeathId = await insertDeathRow({
				bossId,
				date: new Date("2011-11-02T20:00:00.000Z"),
			});
			const secondDeathId = await insertDeathRow({
				bossId,
				date: new Date("2011-11-02T20:15:00.000Z"),
			});

			// Act
			const response = await request(app).delete(deleteBossUrl(bossId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(response.text).toBe("");
			expect(await selectBossRow(bossId)).toBeNull();
			expect(await selectDeathRow(firstDeathId)).toBeNull();
			expect(await selectDeathRow(secondDeathId)).toBeNull();
		});

		test("garde le jeu, ses autres boss et leurs morts", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hollow Knight" });
			const bossId = await insertBossRow({ gameId, name: "False Knight" });
			const otherBossId = await insertBossRow({
				gameId,
				name: "Hornet Protector",
				totalDeath: 1,
			});
			const otherDeathId = await insertDeathRow({
				bossId: otherBossId,
				date: new Date("2017-02-25T18:00:00.000Z"),
			});
			const gameRowBefore = await selectGameRow(gameId);
			const otherBossRowBefore = await selectBossRow(otherBossId);
			const otherDeathRowBefore = await selectDeathRow(otherDeathId);

			// Act
			await request(app).delete(deleteBossUrl(bossId));

			// Assert
			expect(await selectGameRow(gameId)).toStrictEqual(gameRowBefore);
			expect(await selectBossRow(otherBossId)).toStrictEqual(
				otherBossRowBefore,
			);
			expect(await selectDeathRow(otherDeathId)).toStrictEqual(
				otherDeathRowBefore,
			);
		});
	});

	describe("400", () => {
		test.each(buildInvalidPathIdCases("ID"))(
			"refuse un id qui est $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app).delete(deleteBossUrl(pathValue));

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);
	});

	describe("404", () => {
		test("répond que le boss n'existe pas", async () => {
			// Act
			const response = await request(app).delete(
				deleteBossUrl(NON_EXISTENT_ID),
			);

			// Assert
			expectNotFound(response, `No boss with id : ${NON_EXISTENT_ID}`);
		});

		test("répond que le boss n'existe plus à la deuxième suppression", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Cuphead" });
			const bossId = await insertBossRow({ gameId, name: "Hilda Berg" });
			await request(app).delete(deleteBossUrl(bossId));

			// Act
			const response = await request(app).delete(deleteBossUrl(bossId));

			// Assert
			expectNotFound(response, `No boss with id : ${bossId}`);
		});
	});

	describe("500", () => {
		test("répond une erreur générique et la journalise quand la suppression échoue, sans rien supprimer", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Sekiro: Shadows Die Twice" });
			const bossId = await insertBossRow({
				gameId,
				name: "Corrupted Monk",
				totalDeath: 1,
			});
			const deathId = await insertDeathRow({
				bossId,
				date: new Date("2019-04-01T20:00:00.000Z"),
			});
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Boss, "destroy").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app).delete(deleteBossUrl(bossId));

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[DELETE ${deleteBossUrl(bossId)}] Failed to delete boss`,
			});
			expect(await selectBossRow(bossId)).not.toBeNull();
			expect(await selectDeathRow(deathId)).not.toBeNull();
		});
	});
});

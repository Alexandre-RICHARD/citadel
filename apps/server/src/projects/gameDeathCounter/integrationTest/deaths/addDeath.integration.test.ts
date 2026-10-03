import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/deathDto.type.ts";
import { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

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

function addDeathUrl(bossId: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/${bossId}/deaths`;
}

describe("addDeath", () => {
	describe("201 Created", () => {
		it("SHOULD record a death dated now and increment the boss counter", async () => {
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

		it("SHOULD increment for each added death", async () => {
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

		it("SHOULD count every death WHEN they are sent at the same time", async () => {
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

		it("SHOULD accept a death WHEN the boss is already defeated", async () => {
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

		it("SHOULD ignore a sent body, using now as date and an empty comment", async () => {
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

		it("SHOULD only increment the counter of the targeted boss", async () => {
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

	describe("400 Bad Request", () => {
		it.each(buildInvalidPathIdCases("Boss ID"))(
			"SHOULD reject the request WHEN the boss id is $reason",
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

	describe("404 Not Found", () => {
		it("SHOULD answer that the boss does not exist, creating nothing", async () => {
			// Arrange
			const deathCountBefore = await countTableRows("death");

			// Act
			const response = await request(app).post(addDeathUrl(NON_EXISTENT_ID));

			// Assert
			expectNotFound(
				response,
				GameDeathCounterErrorCodeEnum.BOSS_NOT_FOUND,
				`No boss with id : ${NON_EXISTENT_ID}`,
			);
			expect(await countTableRows("death")).toBe(deathCountBefore);
		});
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error, log it and create nothing WHEN the locked read of the boss fails", async () => {
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

		it("SHOULD answer a generic error, log it and keep the counter WHEN inserting the death fails", async () => {
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

		it("SHOULD cancel the already inserted death WHEN incrementing the counter fails", async () => {
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

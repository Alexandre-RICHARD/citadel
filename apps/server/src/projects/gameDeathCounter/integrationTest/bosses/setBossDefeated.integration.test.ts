import type { BossSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossSummaryDto.type.ts";
import { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

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
import { insertDeathRow } from "../../../../testUtils/integration/gameDeathCounter/insertDeathRow.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { selectBossRow } from "../../../../testUtils/integration/gameDeathCounter/selectBossRow.ts";
import { MALFORMED_JSON_BODY } from "../../../../testUtils/integration/malformedJsonBody.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Boss } from "../../models/Boss.ts";

function setBossDefeatedUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/${id}/defeated`;
}

describe("setBossDefeated", () => {
	describe("200 OK", () => {
		it("SHOULD mark the boss as defeated now and make it its last try", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Elden Ring" });
			const bossId = await insertBossRow({
				gameId,
				name: "Malenia, Blade of Miquella",
				totalDeath: 2,
			});
			const firstDeathDate = new Date("2022-04-01T19:00:00.000Z");
			await insertDeathRow({ bossId, date: firstDeathDate });
			await insertDeathRow({
				bossId,
				date: new Date("2022-04-02T19:00:00.000Z"),
			});

			// Act
			const requestStartedAt = new Date();
			const response = await request(app)
				.patch(setBossDefeatedUrl(bossId))
				.send({ defeated: true });
			const requestEndedAt = new Date();

			// Assert : réponse
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const bossDto = response.body as BossSummaryDto;
			expect(bossDto).toStrictEqual({
				id: bossId,
				name: "Malenia, Blade of Miquella",
				firstTry: firstDeathDate.toISOString(),
				lastTry: bossDto.defeatedAt,
				defeatedAt: expect.any(String) as string,
				totalDeath: 2,
			});
			const defeatedAt = new Date(bossDto.defeatedAt ?? "");
			expectDateBetween(defeatedAt, requestStartedAt, requestEndedAt);

			// Assert : base
			expect((await selectBossRow(bossId))?.defeatedAt).toStrictEqual(
				defeatedAt,
			);
		});

		it("SHOULD replace the victory date with now WHEN the boss was already defeated", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hollow Knight" });
			const bossId = await insertBossRow({
				gameId,
				name: "Soul Master",
				defeatedAt: new Date("2017-03-05T20:00:00.000Z"),
			});

			// Act
			const requestStartedAt = new Date();
			await request(app)
				.patch(setBossDefeatedUrl(bossId))
				.send({ defeated: true });
			const requestEndedAt = new Date();

			// Assert
			expectDateBetween(
				(await selectBossRow(bossId))?.defeatedAt ?? new Date(0),
				requestStartedAt,
				requestEndedAt,
			);
		});

		it("SHOULD use the victory date as first and last try WHEN the boss was defeated without dying", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Dark Souls" });
			const bossId = await insertBossRow({ gameId, name: "Taurus Demon" });

			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl(bossId))
				.send({ defeated: true });

			// Assert
			const bossDto = response.body as BossSummaryDto;
			expect(bossDto.firstTry).toBe(bossDto.defeatedAt);
			expect(bossDto.lastTry).toBe(bossDto.defeatedAt);
		});

		it("SHOULD cancel the victory, basing tries on deaths only", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Sekiro: Shadows Die Twice" });
			const bossId = await insertBossRow({
				gameId,
				name: "Owl (Father)",
				totalDeath: 2,
				defeatedAt: new Date("2019-04-10T23:00:00.000Z"),
			});
			const firstDeathDate = new Date("2019-04-10T20:00:00.000Z");
			const lastDeathDate = new Date("2019-04-10T22:00:00.000Z");
			await insertDeathRow({ bossId, date: lastDeathDate });
			await insertDeathRow({ bossId, date: firstDeathDate });

			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl(bossId))
				.send({ defeated: false });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({
				firstTry: firstDeathDate.toISOString(),
				lastTry: lastDeathDate.toISOString(),
				defeatedAt: null,
			});
			expect((await selectBossRow(bossId))?.defeatedAt).toBeNull();
		});

		it("SHOULD leave undefeated a boss that was not defeated, without tries WHEN it was never fought", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Bloodborne" });
			const bossId = await insertBossRow({ gameId, name: "Lady Maria" });

			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl(bossId))
				.send({ defeated: false });

			// Assert
			expect(response.body).toMatchObject({
				firstTry: null,
				lastTry: null,
				defeatedAt: null,
			});
		});

		it("SHOULD not change any other boss", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Cuphead" });
			const bossId = await insertBossRow({ gameId, name: "Cagney Carnation" });
			const otherBossId = await insertBossRow({
				gameId,
				name: "Baroness Von Bon Bon",
			});
			const otherBossRowBefore = await selectBossRow(otherBossId);

			// Act
			await request(app)
				.patch(setBossDefeatedUrl(bossId))
				.send({ defeated: true });

			// Assert
			expect(await selectBossRow(otherBossId)).toStrictEqual(
				otherBossRowBefore,
			);
		});
	});

	describe("400 Bad Request", () => {
		it.each(buildInvalidPathIdCases("ID"))(
			"SHOULD reject the request WHEN the id is $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app)
					.patch(setBossDefeatedUrl(pathValue))
					.send({ defeated: true });

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);

		it.each(buildInvalidBooleanCases("Defeated"))(
			"SHOULD reject the request without changing anything WHEN defeated is $reason",
			async ({ value, message }) => {
				// Arrange
				const gameId = await insertGameRow({ name: "Celeste" });
				const bossId = await insertBossRow({ gameId, name: "Oshiro" });
				const bossRowBefore = await selectBossRow(bossId);

				// Act
				const response = await request(app)
					.patch(setBossDefeatedUrl(bossId))
					.send({ defeated: value });

				// Assert
				expectValidationError(response, [{ path: ["defeated"], message }]);
				expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
			},
		);

		it("SHOULD report both the invalid id and body, the id first", async () => {
			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl("-3"))
				.send({ defeated: "oui" });

			// Assert
			expectValidationError(response, [
				{
					path: ["id"],
					message:
						"ID has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)",
				},
				{ path: ["defeated"], message: "Defeated should be a boolean" },
			]);
		});

		it("SHOULD reject a malformed JSON without changing anything", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Hades" });
			const bossId = await insertBossRow({ gameId, name: "Bone Hydra" });
			const bossRowBefore = await selectBossRow(bossId);

			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl(bossId))
				.set("Content-Type", "application/json")
				.send(MALFORMED_JSON_BODY);

			// Assert
			expectMalformedJsonError(response);
			expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the boss does not exist", async () => {
			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl(NON_EXISTENT_ID))
				.send({ defeated: true });

			// Assert
			expectNotFound(
				response,
				GameDeathCounterErrorCodeEnum.BOSS_NOT_FOUND,
				`No boss with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error, log it and change nothing WHEN reading the boss fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Dark Souls II" });
			const bossId = await insertBossRow({ gameId, name: "Fume Knight" });
			const bossRowBefore = await selectBossRow(bossId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Boss, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl(bossId))
				.send({ defeated: true });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PATCH ${setBossDefeatedUrl(bossId)}] Failed to update boss defeat date`,
			});
			expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
		});

		it("SHOULD answer a generic error, log it and change nothing WHEN the update fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Lords of the Fallen" });
			const bossId = await insertBossRow({
				gameId,
				name: "Pieta, She of Blessed Renewal",
			});
			const bossRowBefore = await selectBossRow(bossId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Boss.prototype, "update").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl(bossId))
				.send({ defeated: true });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PATCH ${setBossDefeatedUrl(bossId)}] Failed to update boss defeat date`,
			});
			expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
		});

		it("SHOULD answer a generic error but keep the victory WHEN computing the tries fails", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Mortal Shell" });
			const bossId = await insertBossRow({
				gameId,
				name: "Tarsus, the First Knight",
			});
			const errorLogWatcher = await watchErrorLogs();
			failRawQueryOnce("MIN(date)");

			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl(bossId))
				.send({ defeated: true });

			// Assert : la mise à jour n'est pas annulée, seul le calcul du résumé a échoué
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PATCH ${setBossDefeatedUrl(bossId)}] Failed to fetch death date range for bosses`,
			});
			expect((await selectBossRow(bossId))?.defeatedAt).not.toBeNull();
		});
	});
});

import type { BossSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossSummaryDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

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

const SET_BOSS_DEFEATED_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:id/defeated`;

function setBossDefeatedUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/${id}/defeated`;
}

describe(`PATCH ${SET_BOSS_DEFEATED_URL}`, () => {
	describe("200", () => {
		test("marque le boss vaincu maintenant et en fait son dernier essai", async () => {
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

		test("remplace la date de victoire d'un boss déjà vaincu par maintenant", async () => {
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

		test("prend la date de victoire comme premier et dernier essai d'un boss vaincu sans mourir", async () => {
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

		test("annule la victoire : les essais ne reposent plus que sur les morts", async () => {
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

		test("laisse non vaincu un boss qui ne l'était pas, sans essai s'il n'a jamais été affronté", async () => {
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

		test("ne modifie aucun autre boss", async () => {
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

	describe("400", () => {
		test.each(buildInvalidPathIdCases("ID"))(
			"refuse un id qui est $reason",
			async ({ pathValue, message }) => {
				// Act
				const response = await request(app)
					.patch(setBossDefeatedUrl(pathValue))
					.send({ defeated: true });

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);

		test.each(buildInvalidBooleanCases("Defeated"))(
			"refuse un statut vaincu qui est $reason, sans rien modifier",
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

		test("signale à la fois l'id et le corps invalides, l'id en premier", async () => {
			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl("-3"))
				.send({ defeated: "oui" });

			// Assert
			expectValidationError(response, [
				{ path: ["id"], message: "ID should be at least 1" },
				{ path: ["defeated"], message: "Defeated should be a boolean" },
			]);
		});

		test("refuse un JSON malformé, sans rien modifier", async () => {
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

	describe("404", () => {
		test("répond que le boss n'existe pas", async () => {
			// Act
			const response = await request(app)
				.patch(setBossDefeatedUrl(NON_EXISTENT_ID))
				.send({ defeated: true });

			// Assert
			expectNotFound(response, `No boss with id : ${NON_EXISTENT_ID}`);
		});
	});

	describe("500", () => {
		test("répond une erreur générique et la journalise quand la lecture du boss échoue, sans rien modifier", async () => {
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

		test("répond une erreur générique et la journalise quand l'écriture échoue, sans rien modifier", async () => {
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

		test("répond une erreur générique quand le calcul des essais échoue, mais la victoire reste enregistrée", async () => {
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

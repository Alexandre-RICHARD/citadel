import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/deathDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

import { app } from "../../../../app.ts";
import { buildInvalidPathIdCases } from "../../../../testUtils/integration/buildInvalidPathIdCases.ts";
import { expectDateBetween } from "../../../../testUtils/integration/expectDateBetween.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { expectMalformedJsonError } from "../../../../testUtils/integration/expectMalformedJsonError.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { insertBossRow } from "../../../../testUtils/integration/gameDeathCounter/insertBossRow.ts";
import { insertDeathRow } from "../../../../testUtils/integration/gameDeathCounter/insertDeathRow.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { selectBossRow } from "../../../../testUtils/integration/gameDeathCounter/selectBossRow.ts";
import { selectDeathRow } from "../../../../testUtils/integration/gameDeathCounter/selectDeathRow.ts";
import { MALFORMED_JSON_BODY } from "../../../../testUtils/integration/malformedJsonBody.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Death } from "../../models/Death.ts";

const UPDATE_DEATH_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/deaths/:id`;

function updateDeathUrl(id: number | string): string {
	return `${ApiPrefixEnum.GAME_DEATH_COUNTER}/deaths/${id}`;
}

// Un jeu, un boss et une mort : la base de départ de la plupart des tests
async function insertDeathScenario({
	gameName,
	bossName,
	date,
	comment = null,
}: {
	gameName: string;
	bossName: string;
	date: Date;
	comment?: string | null;
}): Promise<{ bossId: number; deathId: number }> {
	const gameId = await insertGameRow({ name: gameName });
	const bossId = await insertBossRow({ gameId, name: bossName, totalDeath: 1 });
	const deathId = await insertDeathRow({ bossId, date, comment });
	return { bossId, deathId };
}

describe(`PATCH ${UPDATE_DEATH_URL}`, () => {
	describe("200", () => {
		test("change seulement la date et renvoie la mort à jour", async () => {
			// Arrange
			const { bossId, deathId } = await insertDeathScenario({
				gameName: "Elden Ring",
				bossName: "Godskin Duo",
				date: new Date("2022-03-15T21:00:00.000Z"),
				comment: "Le duo infernal",
			});
			const deathRowBefore = await selectDeathRow(deathId);
			const bossRowBefore = await selectBossRow(bossId);
			const newDate = new Date("2022-03-14T20:30:00.000Z");

			// Act
			const requestStartedAt = new Date();
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ date: newDate.toISOString() });
			const requestEndedAt = new Date();

			// Assert : réponse
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				id: deathId,
				date: newDate.toISOString(),
				comment: "Le duo infernal",
			});

			// Assert : base
			const deathRowAfter = await selectDeathRow(deathId);
			expect(deathRowAfter).toStrictEqual({
				...deathRowBefore,
				date: newDate,
				updatedAt: expect.any(Date) as Date,
			});
			expectDateBetween(
				deathRowAfter?.updatedAt ?? new Date(0),
				requestStartedAt,
				requestEndedAt,
			);
			expect(await selectBossRow(bossId)).toStrictEqual(bossRowBefore);
		});

		test("change seulement le commentaire", async () => {
			// Arrange
			const date = new Date("2016-04-15T19:00:00.000Z");
			const { deathId } = await insertDeathScenario({
				gameName: "Dark Souls III",
				bossName: "Abyss Watchers",
				date,
			});

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ comment: "Le deuxième s'est relevé" });

			// Assert
			expect(response.body).toStrictEqual({
				id: deathId,
				date: date.toISOString(),
				comment: "Le deuxième s'est relevé",
			});
			expect(await selectDeathRow(deathId)).toMatchObject({
				date,
				comment: "Le deuxième s'est relevé",
			});
		});

		test("change la date et le commentaire ensemble", async () => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Bloodborne",
				bossName: "Father Gascoigne",
				date: new Date("2015-03-25T20:00:00.000Z"),
			});
			const newDate = new Date("2015-03-24T22:15:00.000Z");

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ date: newDate.toISOString(), comment: "La boîte à musique !" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(await selectDeathRow(deathId)).toMatchObject({
				date: newDate,
				comment: "La boîte à musique !",
			});
		});

		test("retire les espaces autour du commentaire", async () => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Hollow Knight",
				bossName: "Mantis Lords",
				date: new Date("2017-03-01T20:00:00.000Z"),
			});

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ comment: "\n  Trois à la fois, vraiment ?  \t" });

			// Assert
			expect((response.body as DeathDto).comment).toBe(
				"Trois à la fois, vraiment ?",
			);
			expect((await selectDeathRow(deathId))?.comment).toBe(
				"Trois à la fois, vraiment ?",
			);
		});

		test.each([
			{ reason: "null", comment: null },
			{ reason: "vide", comment: "" },
			{ reason: "fait uniquement d'espaces", comment: "   \t " },
		])("efface le commentaire quand il est $reason", async ({ comment }) => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Cuphead",
				bossName: "Wally Warbles",
				date: new Date("2017-10-05T18:00:00.000Z"),
				comment: "Les oiseaux partout",
			});

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ comment });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((response.body as DeathDto).comment).toBeNull();
			expect((await selectDeathRow(deathId))?.comment).toBeNull();
		});

		test("stocke intact un commentaire de 1000 caractères, le maximum de la colonne", async () => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Dark Souls",
				bossName: "Manus, Father of the Abyss",
				date: new Date("2012-08-24T20:00:00.000Z"),
			});
			const longestComment = "Trop de magie noire. ".repeat(48).slice(0, 1000);

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ comment: longestComment });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((await selectDeathRow(deathId))?.comment).toBe(longestComment);
		});

		test("conserve les accents, idéogrammes et emojis du commentaire", async () => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Ōkami",
				bossName: "Ninetails",
				date: new Date("2006-04-20T20:00:00.000Z"),
			});
			const unicodeComment = "九尾の狐 m'a eu… encore 🦊🔥";

			// Act
			await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ comment: unicodeComment });

			// Assert
			expect((await selectDeathRow(deathId))?.comment).toBe(unicodeComment);
		});

		test("convertit en UTC une date envoyée avec un décalage horaire", async () => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Nine Sols",
				bossName: "Jiequan",
				date: new Date("2024-05-30T21:00:00.000Z"),
			});

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ date: "2024-05-30T23:45:00.000+02:00" });

			// Assert
			expect((response.body as DeathDto).date).toBe("2024-05-30T21:45:00.000Z");
			expect((await selectDeathRow(deathId))?.date).toStrictEqual(
				new Date("2024-05-30T21:45:00.000Z"),
			);
		});

		test("conserve les millisecondes de la date", async () => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Super Meat Boy",
				bossName: "Dr. Fetus",
				date: new Date("2010-10-20T20:00:00.000Z"),
			});

			// Act
			await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ date: "2010-10-20T20:00:00.987Z" });

			// Assert
			expect((await selectDeathRow(deathId))?.date).toStrictEqual(
				new Date("2010-10-20T20:00:00.987Z"),
			);
		});

		test("stocke intacte la plus petite date qu'un DATETIME accepte", async () => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Age of Empires II",
				bossName: "Vlad Dracula",
				date: new Date("1999-09-30T20:00:00.000Z"),
			});

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ date: "1000-01-01T00:00:00.000Z" });

			// Assert
			expect((response.body as DeathDto).date).toBe("1000-01-01T00:00:00.000Z");
			expect((await selectDeathRow(deathId))?.date).toStrictEqual(
				new Date("1000-01-01T00:00:00.000Z"),
			);
		});

		test("ignore les champs inconnus du corps, dont le boss", async () => {
			// Arrange
			const { bossId, deathId } = await insertDeathScenario({
				gameName: "Blasphemous",
				bossName: "Ten Piedad",
				date: new Date("2019-09-11T20:00:00.000Z"),
			});
			const gameId = await insertGameRow({ name: "Blasphemous II" });
			const otherBossId = await insertBossRow({ gameId, name: "Orospina" });

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ comment: "Le premier gros boss", bossId: otherBossId });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((await selectDeathRow(deathId))?.bossId).toBe(bossId);
		});

		test("ne modifie aucune autre mort", async () => {
			// Arrange
			const { bossId, deathId } = await insertDeathScenario({
				gameName: "Hades",
				bossName: "Theseus and Asterius",
				date: new Date("2020-09-20T20:00:00.000Z"),
			});
			const otherDeathId = await insertDeathRow({
				bossId,
				date: new Date("2020-09-20T20:30:00.000Z"),
				comment: "Le taureau m'a chargé",
			});
			const otherDeathRowBefore = await selectDeathRow(otherDeathId);

			// Act
			await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ comment: "Le char de Thésée" });

			// Assert
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
				const response = await request(app)
					.patch(updateDeathUrl(pathValue))
					.send({ comment: "Ornstein" });

				// Assert
				expectValidationError(response, [{ path: ["id"], message }]);
			},
		);

		test.each([
			{
				reason: "le corps est vide",
				body: {},
				issues: [
					{
						path: [],
						message: "At least one of date, comment should be provided",
					},
				],
			},
			{
				reason: "le corps ne contient que des champs inconnus",
				body: { bossId: 3 },
				issues: [
					{
						path: [],
						message: "At least one of date, comment should be provided",
					},
				],
			},
			{
				reason: "la date est du texte libre",
				body: { date: "hier soir" },
				issues: [
					{ path: ["date"], message: "Date should be an ISO 8601 datetime" },
				],
			},
			{
				reason: "la date n'a pas d'heure",
				body: { date: "2024-01-01" },
				issues: [
					{ path: ["date"], message: "Date should be an ISO 8601 datetime" },
				],
			},
			{
				reason: "la date n'a pas de fuseau horaire",
				body: { date: "2024-01-01T10:00:00" },
				issues: [
					{ path: ["date"], message: "Date should be an ISO 8601 datetime" },
				],
			},
			{
				reason: "la date est un nombre",
				body: { date: 1_700_000_000_000 },
				issues: [
					{ path: ["date"], message: "Date should be an ISO 8601 datetime" },
				],
			},
			{
				reason: "la date est null",
				body: { date: null },
				issues: [
					{ path: ["date"], message: "Date should be an ISO 8601 datetime" },
				],
			},
			{
				reason: "la date est dans le futur",
				body: { date: "2999-01-01T00:00:00.000Z" },
				issues: [
					{ path: ["date"], message: "Date should not be in the future" },
				],
			},
			{
				reason: "la date précède l'an 1000, hors de portée d'un DATETIME",
				body: { date: "0999-12-31T23:59:59.999Z" },
				issues: [
					{
						path: ["date"],
						message: "Date should not be before 1000-01-01T00:00:00.000Z",
					},
				],
			},
			{
				reason: "la date est l'an 1, que la base enregistrerait en 2001",
				body: { date: "0001-01-01T00:00:00.000Z" },
				issues: [
					{
						path: ["date"],
						message: "Date should not be before 1000-01-01T00:00:00.000Z",
					},
				],
			},
			{
				reason:
					"la date tombe avant l'an 1000 une fois ramenée en UTC par son décalage horaire",
				body: { date: "1000-01-01T00:30:00.000+01:00" },
				issues: [
					{
						path: ["date"],
						message: "Date should not be before 1000-01-01T00:00:00.000Z",
					},
				],
			},
			{
				reason: "le commentaire est un nombre",
				body: { comment: 5 },
				issues: [{ path: ["comment"], message: "Comment should be a string" }],
			},
			{
				reason:
					"le commentaire contient une moitié d'emoji isolée, que la base remplacerait par �",
				body: { comment: "Encore \uDC00 raté" },
				issues: [
					{
						path: ["comment"],
						message: "Comment should not contain invalid characters",
					},
				],
			},
			{
				reason: "le commentaire dépasse 1000 caractères",
				// Sans espace : le trim passe avant la mesure, une espace finale ramènerait à 1000
				body: { comment: "Raté".repeat(251).slice(0, 1001) },
				issues: [
					{
						path: ["comment"],
						message: "Comment should contain at most 1000 characters",
					},
				],
			},
			{
				reason: "la date et le commentaire sont tous les deux invalides",
				body: { date: 12, comment: 5 },
				issues: [
					{ path: ["date"], message: "Date should be an ISO 8601 datetime" },
					{ path: ["comment"], message: "Comment should be a string" },
				],
			},
		])(
			"refuse la requête quand $reason, sans rien modifier",
			async ({ body, issues }) => {
				// Arrange
				const { deathId } = await insertDeathScenario({
					gameName: "Sekiro: Shadows Die Twice",
					bossName: "Great Shinobi Owl",
					date: new Date("2019-04-05T20:00:00.000Z"),
					comment: "Il m'a jeté de la poudre",
				});
				const deathRowBefore = await selectDeathRow(deathId);

				// Act
				const response = await request(app)
					.patch(updateDeathUrl(deathId))
					.send(body);

				// Assert
				expectValidationError(response, issues);
				expect(await selectDeathRow(deathId)).toStrictEqual(deathRowBefore);
			},
		);

		test("refuse un corps absent", async () => {
			// Act
			const response = await request(app).patch(updateDeathUrl(1));

			// Assert
			expectValidationError(response, [
				{
					path: [],
					message: "Invalid input: expected object, received undefined",
				},
			]);
		});

		test("signale à la fois l'id et le corps invalides, l'id en premier", async () => {
			// Act
			const response = await request(app).patch(updateDeathUrl("abc")).send({});

			// Assert
			expectValidationError(response, [
				{
					path: ["id"],
					message:
						"ID has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)",
				},
				{
					path: [],
					message: "At least one of date, comment should be provided",
				},
			]);
		});

		test("valide le corps avant de chercher la mort", async () => {
			// Act
			const response = await request(app)
				.patch(updateDeathUrl(NON_EXISTENT_ID))
				.send({ comment: 404 });

			// Assert
			expectValidationError(response, [
				{ path: ["comment"], message: "Comment should be a string" },
			]);
		});

		test("refuse un JSON malformé, sans rien modifier", async () => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Dead Cells",
				bossName: "The Time Keeper",
				date: new Date("2018-08-07T20:00:00.000Z"),
			});
			const deathRowBefore = await selectDeathRow(deathId);

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.set("Content-Type", "application/json")
				.send(MALFORMED_JSON_BODY);

			// Assert
			expectMalformedJsonError(response);
			expect(await selectDeathRow(deathId)).toStrictEqual(deathRowBefore);
		});
	});

	describe("404", () => {
		test("répond que la mort n'existe pas", async () => {
			// Act
			const response = await request(app)
				.patch(updateDeathUrl(NON_EXISTENT_ID))
				.send({ comment: "Fantôme" });

			// Assert
			expectNotFound(response, `No death with id : ${NON_EXISTENT_ID}`);
		});
	});

	describe("500", () => {
		test("répond une erreur générique et la journalise quand la lecture de la mort échoue, sans rien modifier", async () => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Demon's Souls",
				bossName: "Tower Knight",
				date: new Date("2009-02-05T20:00:00.000Z"),
			});
			const deathRowBefore = await selectDeathRow(deathId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Death, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ comment: "Les archers sur les remparts" });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PATCH ${updateDeathUrl(deathId)}] Failed to update death`,
			});
			expect(await selectDeathRow(deathId)).toStrictEqual(deathRowBefore);
		});

		test("répond une erreur générique et la journalise quand l'écriture échoue, sans rien modifier", async () => {
			// Arrange
			const { deathId } = await insertDeathScenario({
				gameName: "Remnant II",
				bossName: "Annihilation",
				date: new Date("2023-07-25T20:00:00.000Z"),
			});
			const deathRowBefore = await selectDeathRow(deathId);
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Death.prototype, "update").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app)
				.patch(updateDeathUrl(deathId))
				.send({ comment: "Le dernier boss" });

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PATCH ${updateDeathUrl(deathId)}] Failed to update death`,
			});
			expect(await selectDeathRow(deathId)).toStrictEqual(deathRowBefore);
		});
	});
});

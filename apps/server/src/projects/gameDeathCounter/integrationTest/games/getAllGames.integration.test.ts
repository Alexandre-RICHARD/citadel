import type { GameListDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameListDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

import { app } from "../../../../app.ts";
import { countTableRows } from "../../../../testUtils/integration/countTableRows.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { failRawQueryOnce } from "../../../../testUtils/integration/failRawQueryOnce.ts";
import { insertBossRow } from "../../../../testUtils/integration/gameDeathCounter/insertBossRow.ts";
import { insertDeathRow } from "../../../../testUtils/integration/gameDeathCounter/insertDeathRow.ts";
import { insertGameRow } from "../../../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { Game } from "../../models/Game.ts";

const GET_ALL_GAMES_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games`;

async function getAllGames(): Promise<GameListDto> {
	const response = await request(app).get(GET_ALL_GAMES_URL);
	expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
	return response.body as GameListDto;
}

describe(`GET ${GET_ALL_GAMES_URL}`, () => {
	describe("200", () => {
		test("renvoie chaque jeu avec son total de morts, somme des compteurs de ses boss", async () => {
			// Arrange
			const darkSoulsStartedAt = new Date("2011-09-22T08:00:00.000Z");
			const darkSoulsId = await insertGameRow({
				name: "Dark Souls",
				createdAt: darkSoulsStartedAt,
			});
			await insertBossRow({
				gameId: darkSoulsId,
				name: "Ornstein & Smough",
				totalDeath: 12,
			});
			await insertBossRow({
				gameId: darkSoulsId,
				name: "Knight Artorias",
				totalDeath: 30,
			});

			const cupheadStartedAt = new Date("2017-09-29T14:30:00.250Z");
			const cupheadEndedAt = new Date("2017-11-02T21:45:10.500Z");
			const cupheadId = await insertGameRow({
				name: "Cuphead",
				createdAt: cupheadStartedAt,
				endedAt: cupheadEndedAt,
			});
			await insertBossRow({
				gameId: cupheadId,
				name: "The Devil",
				totalDeath: 7,
			});

			const celesteStartedAt = new Date("2018-01-25T10:00:00.000Z");
			const celesteId = await insertGameRow({
				name: "Celeste",
				createdAt: celesteStartedAt,
			});

			// Act
			const { games } = await getAllGames();

			// Assert
			expect(games.find((game) => game.id === darkSoulsId)).toStrictEqual({
				id: darkSoulsId,
				name: "Dark Souls",
				startedAt: darkSoulsStartedAt.toISOString(),
				endedAt: null,
				totalDeath: 42,
			});
			expect(games.find((game) => game.id === cupheadId)).toStrictEqual({
				id: cupheadId,
				name: "Cuphead",
				startedAt: cupheadStartedAt.toISOString(),
				endedAt: cupheadEndedAt.toISOString(),
				totalDeath: 7,
			});
			expect(games.find((game) => game.id === celesteId)).toStrictEqual({
				id: celesteId,
				name: "Celeste",
				startedAt: celesteStartedAt.toISOString(),
				endedAt: null,
				totalDeath: 0,
			});
		});

		test("additionne les compteurs des boss, même s'ils diffèrent du nombre de morts enregistrées", async () => {
			// Arrange
			const gameId = await insertGameRow({ name: "Sekiro: Shadows Die Twice" });
			const bossId = await insertBossRow({
				gameId,
				name: "Isshin, the Sword Saint",
				totalDeath: 5,
			});
			await insertDeathRow({
				bossId,
				date: new Date("2019-03-30T22:10:00.000Z"),
			});
			await insertDeathRow({
				bossId,
				date: new Date("2019-03-30T22:25:00.000Z"),
			});

			// Act
			const { games } = await getAllGames();

			// Assert
			expect(games.find((game) => game.id === gameId)?.totalDeath).toBe(5);
		});

		test("renvoie tous les jeux de la base", async () => {
			// Arrange
			await insertGameRow({ name: "Hollow Knight" });

			// Act
			const { games } = await getAllGames();

			// Assert
			expect(games).toHaveLength(await countTableRows("game"));
		});

		test("trie par nom sans tenir compte de la casse ni des accents, puis par id", async () => {
			// Arrange : insérés volontairement dans le désordre
			const lowercaseNineSolsId = await insertGameRow({ name: "nine sols" });
			const fezId = await insertGameRow({ name: "Fez" });
			const nineSolsId = await insertGameRow({ name: "Nine Sols" });
			const enderLiliesId = await insertGameRow({ name: "Ēnder Lilies" });
			const deadCellsId = await insertGameRow({ name: "Dead Cells" });
			const insertedIds = [
				lowercaseNineSolsId,
				fezId,
				nineSolsId,
				enderLiliesId,
				deadCellsId,
			];

			// Act
			const { games } = await getAllGames();

			// Assert : les jeux des autres tests s'intercalent, on vérifie l'ordre relatif des nôtres
			const insertedGameIdsInResponseOrder = games
				.map((game) => game.id)
				.filter((id) => insertedIds.includes(id));
			expect(insertedGameIdsInResponseOrder).toStrictEqual([
				deadCellsId,
				enderLiliesId,
				fezId,
				lowercaseNineSolsId,
				nineSolsId,
			]);
		});
	});

	describe("500", () => {
		test("répond une erreur générique et la journalise quand la lecture des jeux échoue", async () => {
			// Arrange
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Game, "findAll").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app).get(GET_ALL_GAMES_URL);

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[GET ${GET_ALL_GAMES_URL}] Failed to fetch games`,
			});
		});

		test("répond une erreur générique et la journalise quand le calcul des totaux échoue", async () => {
			// Arrange : sans aucun jeu en base, le calcul des totaux n'est jamais lancé
			await insertGameRow({ name: "Blasphemous" });
			const errorLogWatcher = await watchErrorLogs();
			failRawQueryOnce("SUM(total_death)");

			// Act
			const response = await request(app).get(GET_ALL_GAMES_URL);

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[GET ${GET_ALL_GAMES_URL}] Failed to fetch total death for games`,
			});
		});
	});
});

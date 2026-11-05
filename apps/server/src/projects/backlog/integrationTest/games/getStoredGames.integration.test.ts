import type { StoredGameListDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameListDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { SEEDED_PLATFORMS } from "../../../../testUtils/integration/backlog/seededPlatforms.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

const STORED_GAMES_URL = `${ApiPrefixEnum.BACKLOG}/games`;

describe("getStoredGames", () => {
	describe("200 OK", () => {
		it("SHOULD list a game WHEN it is only in the backlog of another account", async () => {
			// Arrange
			const word = buildUniqueWord();
			const other = await openSignedInAgent();
			const backlogGame = await seedBacklogGame({
				userId: other.userId,
				name: `${word} elsewhere`,
			});

			// Act
			const response = await player.agent
				.get(STORED_GAMES_URL)
				.query({ query: word });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(response.body as { games: { id: number }[] }).games.map(
					({ id }) => id,
				),
			).toStrictEqual([backlogGame.gameId]);
		});

		it("SHOULD find games outside the backlog by name, French name or version title, without accents or case", async () => {
			// Arrange
			const word = buildUniqueWord();
			const byName = await seedStoredGame({
				name: `Pokémon ${word} Rouge`,
				platformIds: [SEEDED_PLATFORMS.PS2, SEEDED_PLATFORMS.PS3],
			});
			const byFrenchName = await seedStoredGame({
				name: "Other",
				frenchName: `Autre ${word}`,
			});
			await seedStoredGame({
				name: "Third",
				otherVersionTitles: [`${word} Edition`],
			});
			const inBacklog = await seedStoredGame({ name: `${word} in backlog` });
			await insertBacklogRows.userGame({
				userId: player.userId,
				gameId: inBacklog.gameId,
			});

			// Act
			const response = await player.agent
				.get(STORED_GAMES_URL)
				.query({ query: `POKEMON ${word.toLowerCase()}` });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				games: [
					{
						id: byName.gameId,
						name: `Pokémon ${word} Rouge`,
						frenchName: null,
						releaseYear: 2011,
						coverImageId: "co1abc",
						platformNames: ["PS2", "PS3"],
					},
				],
				totalCount: 1,
			});

			const wordResponse = await player.agent
				.get(STORED_GAMES_URL)
				.query({ query: word });
			// Triés par nom affiché (VF, sinon VO), hors backlog
			expect(
				(wordResponse.body as StoredGameListDto).games.map(({ name }) => name),
			).toStrictEqual(["Other", `Pokémon ${word} Rouge`, "Third"]);
			expect((wordResponse.body as StoredGameListDto).totalCount).toBe(3);
			expect(byFrenchName.gameId).toBeGreaterThan(0);
		});

		it("SHOULD give pages of 50 games and the total count", async () => {
			// Arrange
			const word = buildUniqueWord();
			for (let index = 0; index < 51; index += 1)
				// eslint-disable-next-line no-await-in-loop -- les jeux s'ajoutent un par un
				await seedStoredGame({
					name: `${word} ${String(index).padStart(2, "0")}`,
				});

			// Act
			const response = await player.agent
				.get(STORED_GAMES_URL)
				.query({ query: word, page: "2" });

			// Assert
			expect(response.body).toMatchObject({
				games: [{ name: `${word} 50` }],
				totalCount: 51,
			});
		});

		it("SHOULD treat % and _ as plain text", async () => {
			// Arrange
			const word = buildUniqueWord();
			await seedStoredGame({ name: `${word} 100% Orange Juice` });
			await seedStoredGame({ name: `${word} 1000 Orange Juice` });

			// Act
			const response = await player.agent
				.get(STORED_GAMES_URL)
				.query({ query: `${word} 100%` });

			// Assert
			expect(
				(response.body as StoredGameListDto).games.map(({ name }) => name),
			).toStrictEqual([`${word} 100% Orange Juice`]);
		});
	});

	describe("204 No Content", () => {
		it("SHOULD answer without body WHEN no game matches", async () => {
			// Act
			const response = await player.agent
				.get(STORED_GAMES_URL)
				.query({ query: buildUniqueWord() });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD reject a page that is not a positive number", async () => {
			// Act
			const response = await player.agent
				.get(STORED_GAMES_URL)
				.query({ page: "0" });

			// Assert
			expectValidationError(response, [
				{
					path: ["page"],
					code: ValidationIssueCodeEnum.TOO_SMALL,
					limit: 1,
					message: "Page should be at least 1",
				},
			]);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(STORED_GAMES_URL);

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

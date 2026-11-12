import type { UserGameListDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameListDto.type.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
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
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

const USER_GAMES_URL = `${ApiPrefixEnum.BACKLOG}/user-games`;

function gameNames(body: unknown): string[] {
	return (body as UserGameListDto).userGames.map(({ game }) => game.name);
}

describe("getUserGames", () => {
	describe("200 OK", () => {
		it("SHOULD give the most recently touched row first, with what the row needs", async () => {
			// Arrange
			const word = buildUniqueWord();
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: `${word} series`,
			});
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} B`,
				createdAt: new Date("2026-01-01T00:00:00Z"),
			});
			const second = await seedBacklogGame({
				userId: player.userId,
				name: `${word} A`,
				seriesId,
				seriesNumber: 3.1,
				dlcNames: ["DLC"],
				createdAt: new Date("2026-01-02T00:00:00Z"),
			});

			// Act
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ name: word });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(gameNames(response.body)).toStrictEqual([
				`${word} A`,
				`${word} B`,
			]);
			expect((response.body as UserGameListDto).matchedCount).toBe(2);
			expect((response.body as UserGameListDto).userGames[0]).toMatchObject({
				game: { id: second.gameId },
				series: { id: seriesId, name: `${word} series` },
				seriesNumber: 3.1,
				seriesNumberLabel: "3.1",
				dlcs: [{ id: second.dlcIds[0], name: "DLC" }],
			});
		});

		it("SHOULD put a game first WHEN one of its played versions was just changed", async () => {
			// Arrange
			const word = buildUniqueWord();
			const old = await seedBacklogGame({
				userId: player.userId,
				name: `${word} old`,
				createdAt: new Date("2026-01-01T00:00:00Z"),
			});
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} recent`,
				createdAt: new Date("2026-01-02T00:00:00Z"),
			});
			const [oldUserVersionId = 0] = old.userVersionIds;

			// Act
			await player.agent
				.patch(`${ApiPrefixEnum.BACKLOG}/user-versions/${oldUserVersionId}`)
				.send({ rating: 12 });
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ name: word });

			// Assert
			expect(gameNames(response.body)).toStrictEqual([
				`${word} old`,
				`${word} recent`,
			]);
		});

		it("SHOULD sort on several columns, empty values last", async () => {
			// Arrange
			const word = buildUniqueWord();
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} 2`,
				firstReleaseDate: "2001-01-01",
			});
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} 1`,
				firstReleaseDate: null,
			});
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} 3`,
				firstReleaseDate: "2001-01-01",
			});

			// Act
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ name: word, sort: "releaseDate:desc,name:asc" });

			// Assert
			expect(gameNames(response.body)).toStrictEqual([
				`${word} 2`,
				`${word} 3`,
				`${word} 1`,
			]);
		});

		it("SHOULD keep a game WHEN one of its played versions matches the filters", async () => {
			// Arrange
			const word = buildUniqueWord();
			const kept = await seedBacklogGame({
				userId: player.userId,
				name: `${word} kept`,
				userVersionStatuses: [StatusEnum.STARTED, StatusEnum.FINISHED],
				createdAt: new Date("2026-01-02T00:00:00Z"),
			});
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} other`,
				userVersionStatuses: [StatusEnum.STARTED],
				createdAt: new Date("2026-01-01T00:00:00Z"),
			});

			// Act
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ name: word, status: StatusEnum.STARTED, platform: "PS3" });
			const finishedResponse = await player.agent
				.get(USER_GAMES_URL)
				.query({ name: word, status: StatusEnum.FINISHED });

			// Assert : chaque version jouée compte, et la ligne entière reste
			expect(gameNames(response.body)).toStrictEqual([
				`${word} kept`,
				`${word} other`,
			]);
			expect(gameNames(finishedResponse.body)).toStrictEqual([`${word} kept`]);
			expect(
				(finishedResponse.body as UserGameListDto).userGames[0]?.userVersions,
			).toHaveLength(kept.userVersionIds.length);
		});

		it("SHOULD show only the versions played on the filtered platform, not those on its emulator", async () => {
			// Arrange
			const word = buildUniqueWord();
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				name: `${word} Dead Space`,
				userVersionStatuses: [StatusEnum.FINISHED, StatusEnum.STARTED],
			});
			await insertBacklogRows.userVersion({
				userId: player.userId,
				versionId: backlogGame.versionIds[0] ?? 0,
				platformId: SEEDED_PLATFORMS.RPCS3,
			});

			// Act
			const ps3Response = await player.agent
				.get(USER_GAMES_URL)
				.query({ name: word, platform: "PS3" });
			const emulatorResponse = await player.agent
				.get(USER_GAMES_URL)
				.query({ name: word, platform: "RPCS3" });

			// Assert
			function platformNames(body: unknown) {
				return (body as UserGameListDto).userGames[0]?.userVersions.map(
					({ platform }) => platform.shortName,
				);
			}
			expect(platformNames(ps3Response.body)).toStrictEqual(["PS3", "PS3"]);
			expect(platformNames(emulatorResponse.body)).toStrictEqual(["RPCS3"]);
		});

		it("SHOULD keep a game that passes at least one filter WHEN the filters combine with or", async () => {
			// Arrange : un compte à part, car « ou » ne se limite plus au mot cherché
			const account = await openSignedInAgent();
			const word = buildUniqueWord();
			await seedBacklogGame({
				userId: account.userId,
				name: `${word} started`,
				userVersionStatuses: [StatusEnum.STARTED],
			});
			await seedBacklogGame({
				userId: account.userId,
				name: `${word} finished`,
				userVersionStatuses: [StatusEnum.FINISHED],
			});
			await seedBacklogGame({
				userId: account.userId,
				name: `${word} platinum`,
				userVersionStatuses: [StatusEnum.PLATINUM],
			});

			// Act
			const query = { name: word, status: StatusEnum.FINISHED };
			const andResponse = await account.agent.get(USER_GAMES_URL).query(query);
			const orResponse = await account.agent
				.get(USER_GAMES_URL)
				.query({ ...query, name: `${word} s`, filterMode: "or" });

			// Assert : « et » : le nom ET le statut ; « ou » : le nom (started) OU le statut (finished)
			expect(gameNames(andResponse.body)).toStrictEqual([`${word} finished`]);
			expect(gameNames(orResponse.body).toSorted()).toStrictEqual([
				`${word} finished`,
				`${word} started`,
			]);
		});

		it("SHOULD keep a game WHEN it has any of several checked statuses", async () => {
			// Arrange
			const word = buildUniqueWord();
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} platinum`,
				userVersionStatuses: [StatusEnum.PLATINUM],
			});
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} finished`,
				userVersionStatuses: [StatusEnum.FINISHED],
			});
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} started`,
				userVersionStatuses: [StatusEnum.STARTED],
			});

			// Act
			const response = await player.agent.get(USER_GAMES_URL).query({
				name: word,
				status: `${StatusEnum.FINISHED}|${StatusEnum.PLATINUM}`,
				sort: "name:asc",
			});

			// Assert
			expect(gameNames(response.body)).toStrictEqual([
				`${word} finished`,
				`${word} platinum`,
			]);
		});

		it("SHOULD filter on an exact series name and a number range", async () => {
			// Arrange
			const word = buildUniqueWord();
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: `${word} Witcher`,
			});
			const otherSeriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: `${word} Witcher 3`,
			});
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} 1`,
				seriesId,
				seriesNumber: 1,
			});
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} 2`,
				seriesId,
				seriesNumber: 2,
			});
			await seedBacklogGame({
				userId: player.userId,
				name: `${word} 3`,
				seriesId: otherSeriesId,
				seriesNumber: 1,
			});

			// Act
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ series: `=${word} witcher`, seriesNumber: "2.." });

			// Assert
			expect(gameNames(response.body)).toStrictEqual([`${word} 2`]);
		});

		it("SHOULD give pages of 25 rows", async () => {
			// Arrange
			const word = buildUniqueWord();
			for (let index = 0; index < 26; index += 1)
				// eslint-disable-next-line no-await-in-loop -- les jeux s'ajoutent un par un
				await seedBacklogGame({
					userId: player.userId,
					name: `${word} ${String(index).padStart(2, "0")}`,
				});

			// Act
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ name: word, sort: "name:asc", page: "2" });

			// Assert
			expect(gameNames(response.body)).toStrictEqual([`${word} 25`]);
			expect((response.body as UserGameListDto).matchedCount).toBe(26);
		});

		it("SHOULD give an emulator's release date from the console it emulates", async () => {
			// Arrange
			const word = buildUniqueWord();
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				name: word,
				platformIds: [SEEDED_PLATFORMS.PS2],
				firstReleaseDate: "2004-03-01",
			});
			await insertBacklogRows.userVersion({
				userId: player.userId,
				versionId: backlogGame.gameId,
				platformId: SEEDED_PLATFORMS.PCSX2,
			});

			// Act
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ name: word });

			// Assert
			expect(
				(response.body as UserGameListDto).userGames[0]?.userVersions.map(
					({ platform, releaseDate }) => [platform.shortName, releaseDate],
				),
			).toStrictEqual([
				["PS2", "2004-03-01"],
				["PCSX2", "2004-03-01"],
			]);
		});
	});

	describe("204 No Content", () => {
		it("SHOULD answer without body WHEN only another account has games", async () => {
			// Arrange
			const newcomer = await openSignedInAgent();
			await seedBacklogGame({ userId: player.userId });

			// Act
			const response = await newcomer.agent.get(USER_GAMES_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});

		it("SHOULD answer without body WHEN no game matches the filters", async () => {
			// Act
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ name: buildUniqueWord() });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse a sort on a column that does not sort", async () => {
			// Act
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ sort: "thumbnail:asc" });

			// Assert
			expectValidationError(response, [
				{
					path: ["sort"],
					code: ValidationIssueCodeEnum.INVALID_VALUE,
					message:
						'Sort is not readable: sortable columns with asc or desc, each once (e.g. "releaseDate:desc,name:asc")',
				},
			]);
		});

		it("SHOULD refuse an unknown way of combining the filters", async () => {
			// Act
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ filterMode: "xor" });

			// Assert
			expectValidationError(response, [
				{
					path: ["filterMode"],
					code: ValidationIssueCodeEnum.INVALID_VALUE,
					message: "Filter mode should be and or or",
				},
			]);
		});

		it("SHOULD refuse an unreadable filter", async () => {
			// Act
			const response = await player.agent
				.get(USER_GAMES_URL)
				.query({ rating: "high" });

			// Assert
			expectValidationError(response, [
				{
					path: ["rating"],
					code: ValidationIssueCodeEnum.INVALID_VALUE,
					message:
						'rating filter is not readable (e.g. "zelda", "=The Witcher", "finished", "oui", "10..18", "2020-01-01..")',
				},
			]);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(USER_GAMES_URL);

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

import type { UserGameListDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameListDto.type.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { SEEDED_PLATFORMS } from "../../../../testUtils/integration/backlog/seededPlatforms.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";

const USER_GAMES_URL = `${ApiPrefixEnum.BACKLOG}/user-games`;

// Le backlog des autres tests reste en base : chaque test filtre sur un nom que lui seul emploie
function uniqueWord(): string {
	return `Zq${Math.random().toString(36).slice(2, 10)}`;
}

function gameNames(body: unknown): string[] {
	return (body as UserGameListDto).userGames.map(({ game }) => game.name);
}

describe("getUserGames", () => {
	describe("200 OK", () => {
		it("SHOULD give the rows in the order they were added, with what the row needs", async () => {
			// Arrange
			const word = uniqueWord();
			const seriesId = await insertBacklogRows.series({
				name: `${word} series`,
			});
			await seedBacklogGame({
				name: `${word} B`,
				createdAt: new Date("2026-01-01T00:00:00Z"),
			});
			const second = await seedBacklogGame({
				name: `${word} A`,
				seriesId,
				seriesNumber: 3.1,
				dlcNames: ["DLC"],
				createdAt: new Date("2026-01-02T00:00:00Z"),
			});

			// Act
			const response = await request(app)
				.get(USER_GAMES_URL)
				.query({ name: word });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(gameNames(response.body)).toStrictEqual([
				`${word} B`,
				`${word} A`,
			]);
			expect((response.body as UserGameListDto).matchedCount).toBe(2);
			expect((response.body as UserGameListDto).userGames[1]).toMatchObject({
				game: { id: second.gameId },
				series: { id: seriesId, name: `${word} series` },
				seriesNumber: 3.1,
				seriesNumberLabel: "3.1",
				dlcs: [{ id: second.dlcIds[0], name: "DLC" }],
			});
		});

		it("SHOULD sort on several columns, empty values last", async () => {
			// Arrange
			const word = uniqueWord();
			await seedBacklogGame({
				name: `${word} 2`,
				firstReleaseDate: "2001-01-01",
			});
			await seedBacklogGame({ name: `${word} 1`, firstReleaseDate: null });
			await seedBacklogGame({
				name: `${word} 3`,
				firstReleaseDate: "2001-01-01",
			});

			// Act
			const response = await request(app)
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
			const word = uniqueWord();
			const kept = await seedBacklogGame({
				name: `${word} kept`,
				userVersionStatuses: [StatusEnum.STARTED, StatusEnum.FINISHED],
			});
			await seedBacklogGame({
				name: `${word} other`,
				userVersionStatuses: [StatusEnum.STARTED],
			});

			// Act
			const response = await request(app)
				.get(USER_GAMES_URL)
				.query({ name: word, status: StatusEnum.STARTED, platform: "PS3" });
			const finishedResponse = await request(app)
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

		it("SHOULD filter on an exact series name and a number range", async () => {
			// Arrange
			const word = uniqueWord();
			const seriesId = await insertBacklogRows.series({
				name: `${word} Witcher`,
			});
			const otherSeriesId = await insertBacklogRows.series({
				name: `${word} Witcher 3`,
			});
			await seedBacklogGame({ name: `${word} 1`, seriesId, seriesNumber: 1 });
			await seedBacklogGame({ name: `${word} 2`, seriesId, seriesNumber: 2 });
			await seedBacklogGame({
				name: `${word} 3`,
				seriesId: otherSeriesId,
				seriesNumber: 1,
			});

			// Act
			const response = await request(app)
				.get(USER_GAMES_URL)
				.query({ series: `=${word} witcher`, seriesNumber: "2.." });

			// Assert
			expect(gameNames(response.body)).toStrictEqual([`${word} 2`]);
		});

		it("SHOULD give pages of 25 rows", async () => {
			// Arrange
			const word = uniqueWord();
			for (let index = 0; index < 26; index += 1)
				// eslint-disable-next-line no-await-in-loop -- les jeux s'ajoutent un par un
				await seedBacklogGame({
					name: `${word} ${String(index).padStart(2, "0")}`,
				});

			// Act
			const response = await request(app)
				.get(USER_GAMES_URL)
				.query({ name: word, sort: "name:asc", page: "2" });

			// Assert
			expect(gameNames(response.body)).toStrictEqual([`${word} 25`]);
			expect((response.body as UserGameListDto).matchedCount).toBe(26);
		});

		it("SHOULD give an emulator's release date from the console it emulates", async () => {
			// Arrange
			const word = uniqueWord();
			const backlogGame = await seedBacklogGame({
				name: word,
				platformIds: [SEEDED_PLATFORMS.PS2],
				firstReleaseDate: "2004-03-01",
			});
			await insertBacklogRows.userVersion({
				versionId: backlogGame.gameId,
				platformId: SEEDED_PLATFORMS.PCSX2,
			});

			// Act
			const response = await request(app)
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
		it("SHOULD answer without body WHEN no game matches the filters", async () => {
			// Act
			const response = await request(app)
				.get(USER_GAMES_URL)
				.query({ name: uniqueWord() });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse a sort on a column that does not sort", async () => {
			// Act
			const response = await request(app)
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

		it("SHOULD refuse an unreadable filter", async () => {
			// Act
			const response = await request(app)
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
});

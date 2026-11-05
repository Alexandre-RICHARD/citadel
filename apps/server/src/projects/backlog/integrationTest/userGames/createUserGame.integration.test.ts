import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type.ts";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { newUserVersionBody } from "../../../../testUtils/integration/backlog/newUserVersionBody.ts";
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { SEEDED_PLATFORMS } from "../../../../testUtils/integration/backlog/seededPlatforms.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

const CREATE_URL = `${ApiPrefixEnum.BACKLOG}/user-games`;

const DEFAULT_CUSTOMIZATION = {
	imageId: "co1abc",
	endingType: EndingTypeEnum.STORY,
	series: { kind: SeriesChoiceKindEnum.PROPOSED },
	seriesNumber: null,
};

describe("createUserGame", () => {
	describe("201 Created", () => {
		it("SHOULD add a game WHEN it is already in the backlog of another account, on the same version and platform", async () => {
			// Arrange
			const other = await openSignedInAgent();
			const othersGame = await seedBacklogGame({ userId: other.userId });

			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: othersGame.gameId,
				customization: DEFAULT_CUSTOMIZATION,
				userVersion: newUserVersionBody(
					othersGame.gameId,
					SEEDED_PLATFORMS.PS3,
				),
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect(
				await selectBacklogRows.userVersions(player.userId, othersGame.gameId),
			).toHaveLength(1);
			expect(
				await selectBacklogRows.userVersions(other.userId, othersGame.gameId),
			).toHaveLength(1);
		});

		it("SHOULD create a series of its own WHEN another account already has one with that name", async () => {
			// Arrange
			const name = `Series ${buildUniqueWord()}`;
			const other = await openSignedInAgent();
			const othersSeriesId = await insertBacklogRows.series({
				userId: other.userId,
				name,
			});
			const stored = await seedStoredGame();

			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: stored.gameId,
				customization: {
					...DEFAULT_CUSTOMIZATION,
					series: { kind: SeriesChoiceKindEnum.NEW, name },
				},
				userVersion: newUserVersionBody(stored.gameId, SEEDED_PLATFORMS.PS3),
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const seriesRows = await selectBacklogRows.seriesByName(name);
			expect(seriesRows.map(({ userId }) => userId)).toStrictEqual([
				other.userId,
				player.userId,
			]);
			expect(
				(await selectBacklogRows.userGame(player.userId, stored.gameId))
					?.seriesId,
			).not.toBe(othersSeriesId);
		});

		it("SHOULD add the game with its customization and first played version, and give its row", async () => {
			// Arrange
			const stored = await seedStoredGame({
				platformIds: [SEEDED_PLATFORMS.PS2],
				dlcNames: ["DLC 1", "DLC 2"],
			});

			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: stored.gameId,
				customization: {
					...DEFAULT_CUSTOMIZATION,
					series: { kind: SeriesChoiceKindEnum.NONE },
				},
				// Un émulateur de la console de la version est proposé
				userVersion: newUserVersionBody(stored.gameId, SEEDED_PLATFORMS.PCSX2, {
					isOwned: true,
					trackedPlayTimeMinutes: 125,
					rating: 17,
					comment: "  Très bon  ",
					doneDlcIds: [stored.dlcIds[1] ?? 0],
				}),
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const userGame = response.body as UserGameDto;
			expect(userGame).toMatchObject({
				game: { id: stored.gameId },
				imageId: "co1abc",
				endingType: EndingTypeEnum.STORY,
				series: null,
				seriesNumber: null,
				seriesNumberLabel: null,
				dlcs: [
					{ id: stored.dlcIds[0], name: "DLC 1" },
					{ id: stored.dlcIds[1], name: "DLC 2" },
				],
			});
			expect(userGame.userVersions).toStrictEqual([
				{
					id: expect.any(Number) as number,
					version: {
						id: stored.gameId,
						title: null,
						coverImageId: "co1abc",
						igdbUrl: `https://www.igdb.com/games/${stored.gameId}`,
					},
					platform: {
						id: SEEDED_PLATFORMS.PCSX2,
						shortName: "PCSX2",
						technicalName: "pcsx2",
						emulatedPlatformId: SEEDED_PLATFORMS.PS2,
					},
					// Un émulateur reprend la date de sortie sur la console émulée
					releaseDate: "2011-11-11",
					status: StatusEnum.NOT_STARTED,
					isOwned: true,
					isUpNext: false,
					finishDate: null,
					sureFinishCount: 0,
					probableFinishCount: 0,
					trackedPlayTimeMinutes: 125,
					estimatedPlayTimeMinutes: 0,
					rating: 17,
					comment: "Très bon",
					doneDlcIds: [stored.dlcIds[1]],
				},
			]);
		});

		it("SHOULD count a first sure finish WHEN the version starts finished", async () => {
			// Arrange
			const stored = await seedStoredGame();

			// Act
			await player.agent.post(CREATE_URL).send({
				gameId: stored.gameId,
				customization: DEFAULT_CUSTOMIZATION,
				userVersion: newUserVersionBody(stored.gameId, SEEDED_PLATFORMS.PS3, {
					status: StatusEnum.FINISHED,
					finishDate: "2020-05-01",
				}),
			});

			// Assert
			expect(
				await selectBacklogRows.userVersions(player.userId, stored.gameId),
			).toMatchObject([
				{
					status: StatusEnum.FINISHED,
					sureFinishCount: 1,
					finishDate: "2020-05-01",
				},
			]);
		});

		it("SHOULD place the game after the others of its proposed series WHEN no number is given", async () => {
			// Arrange
			// Une série proposée vient toujours d'IGDB
			const seriesId = await insertBacklogRows.series({
				name: "Zelda",
				igdbFranchiseId: await nextIgdbId(),
			});
			await seedBacklogGame({
				userId: player.userId,
				seriesId,
				seriesNumber: 2.5,
				proposedSeriesId: seriesId,
			});
			const stored = await seedStoredGame({ proposedSeriesId: seriesId });

			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: stored.gameId,
				customization: DEFAULT_CUSTOMIZATION,
				userVersion: newUserVersionBody(stored.gameId, SEEDED_PLATFORMS.PS3),
			});

			// Assert
			expect(response.body).toMatchObject({
				series: { id: seriesId, name: "Zelda" },
				seriesNumber: 3,
				seriesNumberLabel: "3",
			});
		});

		it("SHOULD push the game that had the number WHEN the number is taken", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: "Mario",
			});
			const first = await seedBacklogGame({
				userId: player.userId,
				seriesId,
				seriesNumber: 1,
			});
			const second = await seedBacklogGame({
				userId: player.userId,
				seriesId,
				seriesNumber: 2,
			});
			const stored = await seedStoredGame();

			// Act
			await player.agent.post(CREATE_URL).send({
				gameId: stored.gameId,
				customization: {
					...DEFAULT_CUSTOMIZATION,
					series: { kind: SeriesChoiceKindEnum.OTHER, seriesId },
					seriesNumber: 1,
				},
				userVersion: newUserVersionBody(stored.gameId, SEEDED_PLATFORMS.PS3),
			});

			// Assert
			expect(
				await selectBacklogRows.userGame(player.userId, stored.gameId),
			).toMatchObject({
				seriesId,
				seriesNumber: 1,
			});
			expect(
				(await selectBacklogRows.userGame(player.userId, first.gameId))
					?.seriesNumber,
			).toBe(2);
			expect(
				(await selectBacklogRows.userGame(player.userId, second.gameId))
					?.seriesNumber,
			).toBe(3);
		});

		it("SHOULD join the existing series WHEN a new series has a taken name, without accents or case", async () => {
			// Arrange
			const name = `Série ${Math.random().toString(36).slice(2, 8)}`;
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name,
			});
			const stored = await seedStoredGame();

			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: stored.gameId,
				customization: {
					...DEFAULT_CUSTOMIZATION,
					series: {
						kind: SeriesChoiceKindEnum.NEW,
						name: ` ${name.toUpperCase().replace("É", "E")} `,
					},
				},
				userVersion: newUserVersionBody(stored.gameId, SEEDED_PLATFORMS.PS3),
			});

			// Assert
			expect(response.body).toMatchObject({
				series: { id: seriesId, name },
				seriesNumber: 1,
			});
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse a status that the ending type does not offer", async () => {
			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: 42,
				customization: {
					...DEFAULT_CUSTOMIZATION,
					endingType: EndingTypeEnum.SANDBOX,
				},
				userVersion: newUserVersionBody(42, SEEDED_PLATFORMS.PS3, {
					status: StatusEnum.FINISHED,
				}),
			});

			// Assert
			expectValidationError(response, [
				{
					path: ["userVersion", "status"],
					code: ValidationIssueCodeEnum.INCOMPATIBLE_VALUE,
					message: "Status should be offered by the ending type",
				},
			]);
		});

		it("SHOULD refuse a series number with more than 3 decimals", async () => {
			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: 42,
				customization: { ...DEFAULT_CUSTOMIZATION, seriesNumber: 3.1234 },
				userVersion: newUserVersionBody(42, SEEDED_PLATFORMS.PS3),
			});

			// Assert
			expectValidationError(response, [
				{
					path: ["customization", "seriesNumber"],
					code: ValidationIssueCodeEnum.TOO_MANY_DECIMALS,
					limit: 3,
					message: "Series number should have at most 3 decimals",
				},
			]);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD refuse a series created by another account, and add nothing", async () => {
			// Arrange
			const other = await openSignedInAgent();
			const othersSeriesId = await insertBacklogRows.series({
				userId: other.userId,
				name: "Private",
			});
			const stored = await seedStoredGame();

			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: stored.gameId,
				customization: {
					...DEFAULT_CUSTOMIZATION,
					series: {
						kind: SeriesChoiceKindEnum.OTHER,
						seriesId: othersSeriesId,
					},
				},
				userVersion: newUserVersionBody(stored.gameId, SEEDED_PLATFORMS.PS3),
			});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.SERIES_NOT_FOUND,
				`No series with id : ${othersSeriesId}`,
			);
			expect(
				await selectBacklogRows.userGame(player.userId, stored.gameId),
			).toBeNull();
		});

		it("SHOULD answer that the game is not stored", async () => {
			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: NON_EXISTENT_ID,
				customization: DEFAULT_CUSTOMIZATION,
				userVersion: newUserVersionBody(NON_EXISTENT_ID, SEEDED_PLATFORMS.PS3),
			});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${NON_EXISTENT_ID}`,
			);
		});

		it("SHOULD refuse a version of another game, and add nothing", async () => {
			// Arrange
			const stored = await seedStoredGame();
			const other = await seedStoredGame();

			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: stored.gameId,
				customization: DEFAULT_CUSTOMIZATION,
				userVersion: newUserVersionBody(other.gameId, SEEDED_PLATFORMS.PS3),
			});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.VERSION_NOT_FOUND,
				`No version with id ${other.gameId} for game : ${stored.gameId}`,
			);
			expect(
				await selectBacklogRows.userGame(player.userId, stored.gameId),
			).toBeNull();
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse a game already in the backlog", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
			});

			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: backlogGame.gameId,
				customization: DEFAULT_CUSTOMIZATION,
				userVersion: newUserVersionBody(
					backlogGame.gameId,
					SEEDED_PLATFORMS.PS2,
				),
			});

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.USER_GAME_ALREADY_EXISTS,
				`Game already in the backlog : ${backlogGame.gameId}`,
			);
		});

		it("SHOULD refuse a platform the version was not released on", async () => {
			// Arrange
			const stored = await seedStoredGame({
				platformIds: [SEEDED_PLATFORMS.PS3],
			});

			// Act
			const response = await player.agent.post(CREATE_URL).send({
				gameId: stored.gameId,
				customization: DEFAULT_CUSTOMIZATION,
				userVersion: newUserVersionBody(stored.gameId, SEEDED_PLATFORMS.PCSX2),
			});

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.PLATFORM_NOT_ALLOWED,
				`Platform ${SEEDED_PLATFORMS.PCSX2} is not offered for version : ${stored.gameId}`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).post(CREATE_URL).send({});

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

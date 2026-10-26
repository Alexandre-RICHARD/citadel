import type { StoredGameDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameDto.type.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { buildIgdbGameData } from "../../../../testUtils/integration/backlog/buildIgdbGameData.ts";
import { IGDB_PLATFORMS } from "../../../../testUtils/integration/backlog/igdbPlatforms.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { igdbGateway } from "../../igdb/igdbGateway.ts";

const STORE_URL = `${ApiPrefixEnum.BACKLOG}/games`;

// Un jeu IGDB à deux autres versions et deux DLC, avec sa collection et son développeur
async function mockIgdbGame() {
	const ids = {
		gameId: await nextIgdbId(),
		editionId: await nextIgdbId(),
		portId: await nextIgdbId(),
		firstDlcId: await nextIgdbId(),
		secondDlcId: await nextIgdbId(),
		collectionId: await nextIgdbId(),
		developerId: await nextIgdbId(),
		newPlatformId: await nextIgdbId(),
	};
	vi.spyOn(igdbGateway, "fetchGameData").mockResolvedValueOnce(
		buildIgdbGameData({
			id: ids.gameId,
			name: "The Elder Scrolls V: Skyrim",
			frenchName: "Skyrim (FR)",
			releaseDate: "2011-11-11",
			platforms: [IGDB_PLATFORMS.PS3],
			otherVersions: [
				{
					id: ids.editionId,
					versionTitle: "Legendary Edition",
					platforms: [IGDB_PLATFORMS.PS3],
				},
				{
					id: ids.portId,
					typeName: "Port",
					platforms: [
						{
							id: ids.newPlatformId,
							name: "Nintendo Switch",
							abbreviation: "Switch",
							slug: "switch",
						},
					],
					releaseDate: "2017-11-17",
				},
			],
			dlcs: [
				{ id: ids.firstDlcId, name: "Dawnguard" },
				{ id: ids.secondDlcId, name: "Hearthfire" },
			],
			collection: { id: ids.collectionId, name: "The Elder Scrolls" },
			developer: { id: ids.developerId, name: "Bethesda Game Studios" },
		}),
	);
	return ids;
}

describe("storeGame", () => {
	describe("201 Created", () => {
		it("SHOULD store the game, its original version, the checked versions and DLC, its series and companies", async () => {
			// Arrange
			const ids = await mockIgdbGame();

			// Act
			const response = await request(app)
				.post(STORE_URL)
				.send({
					igdbId: ids.gameId,
					versionIds: [ids.portId],
					dlcIds: [ids.firstDlcId],
				});

			// Assert : réponse
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const game = response.body as StoredGameDto;
			expect(game).toMatchObject({
				id: ids.gameId,
				name: "The Elder Scrolls V: Skyrim",
				frenchName: "Skyrim (FR)",
				firstReleaseDate: "2011-11-11",
				proposedSeries: { name: "The Elder Scrolls" },
				developer: { id: ids.developerId, name: "Bethesda Game Studios" },
				dlcs: [{ id: ids.firstDlcId, name: "Dawnguard" }],
				customization: null,
			});
			expect(
				game.versions.map(({ id, title }) => ({ id, title })),
			).toStrictEqual([
				{ id: ids.gameId, title: null },
				{ id: ids.portId, title: "Portage 2017" },
			]);
			expect(game.versions[1]?.platformOptions).toStrictEqual([
				{
					id: ids.newPlatformId,
					shortName: "Switch",
					technicalName: "switch",
					emulatedPlatformId: null,
				},
			]);

			// Assert : base
			expect(await selectBacklogRows.gameIds(ids.gameId)).toStrictEqual({
				versionIds: [ids.gameId, ids.portId],
				dlcIds: [ids.firstDlcId],
			});
			expect(
				await selectBacklogRows.series(game.proposedSeries?.id ?? 0),
			).toMatchObject({
				igdbCollectionId: ids.collectionId,
				igdbFranchiseId: null,
			});
		});

		it("SHOULD reuse the proposed series WHEN another game brought it", async () => {
			// Arrange
			const ids = await mockIgdbGame();
			const seriesId = await insertBacklogRows.series({
				name: "The Elder Scrolls",
				igdbCollectionId: ids.collectionId,
			});

			// Act
			const response = await request(app)
				.post(STORE_URL)
				.send({ igdbId: ids.gameId, versionIds: [], dlcIds: [] });

			// Assert
			expect((response.body as StoredGameDto).proposedSeries).toStrictEqual({
				id: seriesId,
				name: "The Elder Scrolls",
			});
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD reject the request WHEN a version is checked twice", async () => {
			// Act
			const response = await request(app)
				.post(STORE_URL)
				.send({ igdbId: 42, versionIds: [7, 7], dlcIds: [] });

			// Assert
			expectValidationError(response, [
				{
					path: ["versionIds"],
					code: ValidationIssueCodeEnum.DUPLICATE_VALUE,
					message: "Version IDs should not contain the same id twice",
				},
			]);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD refuse a checked version that IGDB does not give, and store nothing", async () => {
			// Arrange
			const ids = await mockIgdbGame();
			const unknownVersionId = await nextIgdbId();

			// Act
			const response = await request(app)
				.post(STORE_URL)
				.send({
					igdbId: ids.gameId,
					versionIds: [unknownVersionId],
					dlcIds: [],
				});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.VERSION_NOT_FOUND,
				`No version with id ${unknownVersionId} in IGDB game : ${ids.gameId}`,
			);
			expect(await selectBacklogRows.gameIds(ids.gameId)).toStrictEqual({
				versionIds: [],
				dlcIds: [],
			});
		});

		it("SHOULD answer that the IGDB game does not exist", async () => {
			// Arrange
			const igdbId = await nextIgdbId();
			vi.spyOn(igdbGateway, "fetchGameData").mockResolvedValueOnce(null);

			// Act
			const response = await request(app)
				.post(STORE_URL)
				.send({ igdbId, versionIds: [], dlcIds: [] });

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.IGDB_GAME_NOT_FOUND,
				`No IGDB game with id : ${igdbId}`,
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse a game already stored, without changing it", async () => {
			// Arrange
			const stored = await seedStoredGame();
			vi.spyOn(igdbGateway, "fetchGameData").mockResolvedValueOnce(
				buildIgdbGameData({
					id: stored.gameId,
					name: "Skyrim",
					platforms: [IGDB_PLATFORMS.PS3],
					dlcs: [{ id: await nextIgdbId(), name: "Dragonborn" }],
				}),
			);

			// Act
			const response = await request(app)
				.post(STORE_URL)
				.send({ igdbId: stored.gameId, versionIds: [], dlcIds: [] });

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.GAME_ALREADY_STORED,
				`Game already stored : ${stored.gameId}`,
			);
			expect(await selectBacklogRows.gameIds(stored.gameId)).toStrictEqual({
				versionIds: stored.versionIds,
				dlcIds: [],
			});
		});
	});
});

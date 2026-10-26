import type { GamePreviewDto } from "@citadel/specs/src/projects/backlog/dto/igdb/gamePreviewDto.type.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { buildIgdbGameData } from "../../../../testUtils/integration/backlog/buildIgdbGameData.ts";
import { IGDB_PLATFORMS } from "../../../../testUtils/integration/backlog/igdbPlatforms.ts";
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { SEEDED_PLATFORMS } from "../../../../testUtils/integration/backlog/seededPlatforms.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { buildInvalidPathIdCases } from "../../../../testUtils/integration/buildInvalidPathIdCases.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { igdbGateway } from "../../igdb/igdbGateway.ts";

function previewUrl(igdbId: number | string): string {
	return `${ApiPrefixEnum.BACKLOG}/igdb/games/${igdbId}`;
}

const PCSX2 = {
	id: SEEDED_PLATFORMS.PCSX2,
	shortName: "PCSX2",
	technicalName: "pcsx2",
	emulatedPlatformId: SEEDED_PLATFORMS.PS2,
};

describe("getGamePreview", () => {
	describe("200 OK", () => {
		it("SHOULD describe a new game, its versions with their emulators, and its DLC", async () => {
			// Arrange
			const gameId = await nextIgdbId();
			const remasterId = await nextIgdbId();
			const dlcId = await nextIgdbId();
			const developerId = await nextIgdbId();
			vi.spyOn(igdbGateway, "fetchGameData").mockResolvedValueOnce(
				buildIgdbGameData({
					id: gameId,
					name: "Okami",
					releaseDate: "2006-04-20",
					platforms: [IGDB_PLATFORMS.PS2],
					otherVersions: [
						{
							id: remasterId,
							typeName: "Remaster",
							platforms: [IGDB_PLATFORMS.PS3],
							releaseDate: "2012-10-30",
						},
					],
					dlcs: [{ id: dlcId, name: "Okami Art Book" }],
					collection: { id: 9001, name: "Okami" },
					developer: { id: developerId, name: "Clover Studio" },
				}),
			);

			// Act
			const response = await request(app).get(previewUrl(gameId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				game: {
					id: gameId,
					name: "Okami",
					frenchName: null,
					firstReleaseDate: "2006-04-20",
					isCancelled: false,
					igdbUrl: `https://www.igdb.com/games/${gameId}`,
				},
				isStored: false,
				proposedSeriesName: "Okami",
				developer: {
					id: developerId,
					name: "Clover Studio",
					logoImageId: null,
				},
				publisher: {
					id: developerId,
					name: "Clover Studio",
					logoImageId: null,
				},
				versions: [
					{
						id: gameId,
						title: null,
						coverImageId: `co${gameId}`,
						igdbUrl: `https://www.igdb.com/games/${gameId}`,
						isStored: false,
						platforms: [
							{
								platform: {
									id: 8,
									shortName: "PS2",
									technicalName: "ps2",
									emulatedPlatformId: null,
								},
								releaseDate: "2006-04-20",
							},
						],
						platformOptions: [
							{
								id: 8,
								shortName: "PS2",
								technicalName: "ps2",
								emulatedPlatformId: null,
							},
							PCSX2,
						],
					},
					{
						id: remasterId,
						// Même nom que le jeu, sans titre : son type et son année
						title: "Remaster 2012",
						coverImageId: null,
						igdbUrl: `https://www.igdb.com/games/${remasterId}`,
						isStored: false,
						platforms: [
							{
								platform: {
									id: 9,
									shortName: "PS3",
									technicalName: "ps3",
									emulatedPlatformId: null,
								},
								releaseDate: "2012-10-30",
							},
						],
						platformOptions: [
							{
								id: 9,
								shortName: "PS3",
								technicalName: "ps3",
								emulatedPlatformId: null,
							},
							{
								id: SEEDED_PLATFORMS.RPCS3,
								shortName: "RPCS3",
								technicalName: "rpcs3",
								emulatedPlatformId: SEEDED_PLATFORMS.PS3,
							},
						],
					},
				],
				dlcs: [
					{
						id: dlcId,
						name: "Okami Art Book",
						isStored: false,
						storedGameId: null,
					},
				],
				imageIds: [`co${gameId}`, `ar${gameId}`],
				warnings: [],
			});
		});

		it("SHOULD show a stored game from the base, completed by the IGDB versions and DLC it lacks", async () => {
			// Arrange
			const stored = await seedStoredGame({
				name: "Dark Souls",
				otherVersionTitles: ["Prepare to Die Edition"],
				dlcNames: ["Artorias of the Abyss"],
			});
			const remasteredId = await nextIgdbId();
			const newDlcId = await nextIgdbId();
			vi.spyOn(igdbGateway, "fetchGameData").mockResolvedValueOnce(
				buildIgdbGameData({
					id: stored.gameId,
					name: "DARK SOULS (renamed on IGDB)",
					platforms: [IGDB_PLATFORMS.PS3],
					otherVersions: [
						{
							id: remasteredId,
							versionTitle: "Remastered",
							platforms: [IGDB_PLATFORMS.PS3],
						},
					],
					dlcs: [
						{ id: stored.dlcIds[0] ?? 0, name: "Artorias of the Abyss" },
						{ id: newDlcId, name: "Some new DLC" },
					],
				}),
			);

			// Act
			const response = await request(app).get(previewUrl(stored.gameId));

			// Assert
			const preview = response.body as GamePreviewDto;
			expect(preview.isStored).toBe(true);
			expect(preview.game.name).toBe("Dark Souls");
			expect(
				preview.versions.map(({ id, title, isStored }) => ({
					id,
					title,
					isStored,
				})),
			).toStrictEqual([
				{ id: stored.gameId, title: null, isStored: true },
				{ id: remasteredId, title: "Remastered", isStored: false },
				{
					id: stored.versionIds[1],
					title: "Prepare to Die Edition",
					isStored: true,
				},
			]);
			expect(
				preview.dlcs.map(({ id, isStored }) => ({ id, isStored })),
			).toStrictEqual([
				{ id: stored.dlcIds[0], isStored: true },
				{ id: newDlcId, isStored: false },
			]);
		});

		it("SHOULD give the game of a DLC already stored as a game apart", async () => {
			// Arrange
			const dlcAsGame = await seedStoredGame({ name: "The Lost and Damned" });
			const gameId = await nextIgdbId();
			vi.spyOn(igdbGateway, "fetchGameData").mockResolvedValueOnce(
				buildIgdbGameData({
					id: gameId,
					name: "Grand Theft Auto IV",
					platforms: [IGDB_PLATFORMS.PS3],
					dlcs: [{ id: dlcAsGame.gameId, name: "The Lost and Damned" }],
				}),
			);

			// Act
			const response = await request(app).get(previewUrl(gameId));

			// Assert
			expect((response.body as GamePreviewDto).dlcs).toStrictEqual([
				{
					id: dlcAsGame.gameId,
					name: "The Lost and Damned",
					isStored: false,
					storedGameId: dlcAsGame.gameId,
				},
			]);
		});
	});

	describe("400 Bad Request", () => {
		it.each(buildInvalidPathIdCases("IGDB ID"))(
			"SHOULD reject the request WHEN the id is $reason",
			async ({ pathValue, issue }) => {
				// Act
				const response = await request(app).get(previewUrl(pathValue));

				// Assert
				expectValidationError(response, [{ path: ["igdbId"], ...issue }]);
			},
		);
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the IGDB game does not exist", async () => {
			// Arrange
			const igdbId = await nextIgdbId();
			vi.spyOn(igdbGateway, "fetchGameData").mockResolvedValueOnce(null);

			// Act
			const response = await request(app).get(previewUrl(igdbId));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.IGDB_GAME_NOT_FOUND,
				`No IGDB game with id : ${igdbId}`,
			);
		});
	});
});

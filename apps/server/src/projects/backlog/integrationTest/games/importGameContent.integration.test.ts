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
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";
import { igdbGateway } from "../../igdb/igdbGateway.ts";

function importUrl(gameId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/games/${gameId}/imports`;
}

describe("importGameContent", () => {
	describe("200 OK", () => {
		it("SHOULD add the checked versions and DLC, and ignore those already stored", async () => {
			// Arrange
			const stored = await seedStoredGame({ dlcNames: ["Dawnguard"] });
			const editionId = await nextIgdbId();
			const newDlcId = await nextIgdbId();
			const storedDlcId = stored.dlcIds[0] ?? 0;
			vi.spyOn(igdbGateway, "fetchGameData").mockResolvedValueOnce(
				buildIgdbGameData({
					id: stored.gameId,
					name: "Skyrim",
					platforms: [IGDB_PLATFORMS.PS3],
					otherVersions: [
						{
							id: editionId,
							versionTitle: "Special Edition",
							platforms: [IGDB_PLATFORMS.PS3],
						},
					],
					dlcs: [
						{ id: storedDlcId, name: "Dawnguard" },
						{ id: newDlcId, name: "Dragonborn" },
					],
				}),
			);

			// Act
			const response = await request(app)
				.post(importUrl(stored.gameId))
				.send({
					versionIds: [editionId, stored.gameId],
					dlcIds: [storedDlcId, newDlcId],
				});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(response.body as StoredGameDto).versions.map(({ id }) => id),
			).toStrictEqual([stored.gameId, editionId]);
			expect(await selectBacklogRows.gameIds(stored.gameId)).toStrictEqual({
				versionIds: [stored.gameId, editionId],
				dlcIds: [storedDlcId, newDlcId],
			});
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD reject the request WHEN nothing is checked", async () => {
			// Act
			const response = await request(app)
				.post(importUrl(42))
				.send({ versionIds: [], dlcIds: [] });

			// Assert
			expectValidationError(response, [
				{
					path: [],
					code: ValidationIssueCodeEnum.MISSING_FIELDS,
					message: "At least one version or DLC should be given",
				},
			]);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the game is not stored", async () => {
			// Act
			const response = await request(app)
				.post(importUrl(NON_EXISTENT_ID))
				.send({ versionIds: [7], dlcIds: [] });

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.GAME_NOT_FOUND,
				`No game with id : ${NON_EXISTENT_ID}`,
			);
		});

		it("SHOULD refuse a DLC that IGDB does not give for this game", async () => {
			// Arrange
			const stored = await seedStoredGame();
			const unknownDlcId = await nextIgdbId();
			vi.spyOn(igdbGateway, "fetchGameData").mockResolvedValueOnce(
				buildIgdbGameData({
					id: stored.gameId,
					name: "Skyrim",
					platforms: [IGDB_PLATFORMS.PS3],
				}),
			);

			// Act
			const response = await request(app)
				.post(importUrl(stored.gameId))
				.send({ versionIds: [], dlcIds: [unknownDlcId] });

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.DLC_NOT_FOUND,
				`No DLC with id ${unknownDlcId} in IGDB game : ${stored.gameId}`,
			);
		});
	});
});

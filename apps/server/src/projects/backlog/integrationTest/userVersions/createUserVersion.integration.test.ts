import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type.ts";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { newUserVersionBody } from "../../../../testUtils/integration/backlog/newUserVersionBody.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { SEEDED_PLATFORMS } from "../../../../testUtils/integration/backlog/seededPlatforms.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";

function createUrl(gameId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-games/${gameId}/user-versions`;
}

describe("createUserVersion", () => {
	describe("201 Created", () => {
		it("SHOULD add the played version after the others and give the row", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				otherVersionTitles: ["Remastered"],
				dlcNames: ["DLC"],
			});

			// Act
			const response = await request(app)
				.post(createUrl(backlogGame.gameId))
				.send(
					newUserVersionBody(
						backlogGame.versionIds[1] ?? 0,
						SEEDED_PLATFORMS.PS3,
						{
							status: StatusEnum.PLATINUM,
							doneDlcIds: backlogGame.dlcIds,
						},
					),
				);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			const { userVersions } = response.body as UserGameDto;
			expect(userVersions).toHaveLength(2);
			expect(userVersions[1]).toMatchObject({
				version: { id: backlogGame.versionIds[1], title: "Remastered" },
				status: StatusEnum.PLATINUM,
				// Rang 7 : « fois fini (sûr) » passe à 1
				sureFinishCount: 1,
				doneDlcIds: backlogGame.dlcIds,
			});
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the game is not in the backlog", async () => {
			// Arrange
			const stored = await seedStoredGame();

			// Act
			const response = await request(app)
				.post(createUrl(stored.gameId))
				.send(newUserVersionBody(stored.gameId, SEEDED_PLATFORMS.PS3));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_GAME_NOT_FOUND,
				`No backlog game with id : ${stored.gameId}`,
			);
		});

		it("SHOULD refuse a DLC of another game", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				otherVersionTitles: ["Remastered"],
			});
			const other = await seedStoredGame({ dlcNames: ["Not mine"] });

			// Act
			const response = await request(app)
				.post(createUrl(backlogGame.gameId))
				.send(
					newUserVersionBody(
						backlogGame.versionIds[1] ?? 0,
						SEEDED_PLATFORMS.PS3,
						{
							doneDlcIds: other.dlcIds,
						},
					),
				);

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.DLC_NOT_FOUND,
				`No DLC with id ${other.dlcIds[0]} for game : ${backlogGame.gameId}`,
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse the same version on the same platform twice", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame();

			// Act
			const response = await request(app)
				.post(createUrl(backlogGame.gameId))
				.send(newUserVersionBody(backlogGame.gameId, SEEDED_PLATFORMS.PS3));

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.USER_VERSION_ALREADY_EXISTS,
				`Version ${backlogGame.gameId} is already played on platform : ${SEEDED_PLATFORMS.PS3}`,
			);
		});

		it("SHOULD refuse a status that the ending type of the game does not offer", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				endingType: EndingTypeEnum.MULTIPLAYER,
				otherVersionTitles: ["Remastered"],
			});

			// Act
			const response = await request(app)
				.post(createUrl(backlogGame.gameId))
				.send(
					newUserVersionBody(
						backlogGame.versionIds[1] ?? 0,
						SEEDED_PLATFORMS.PS3,
						{
							status: StatusEnum.WATCHED,
						},
					),
				);

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.STATUS_NOT_ALLOWED,
				`Status ${StatusEnum.WATCHED} is not offered for ending type : ${EndingTypeEnum.MULTIPLAYER}`,
			);
		});
	});
});

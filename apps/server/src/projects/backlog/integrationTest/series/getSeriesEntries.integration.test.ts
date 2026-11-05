import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

const SERIES_URL = `${ApiPrefixEnum.BACKLOG}/series`;

function entriesUrl(seriesId: number): string {
	return `${SERIES_URL}/${seriesId}/entries`;
}

describe("getSeriesEntries", () => {
	describe("200 OK", () => {
		it("SHOULD give only the games of the account WHEN the IGDB series is shared", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				name: "Metroid",
				igdbCollectionId: await nextIgdbId(),
			});
			const mine = await seedBacklogGame({
				userId: player.userId,
				seriesId,
				seriesNumber: 1,
			});
			const other = await openSignedInAgent();
			await seedBacklogGame({
				userId: other.userId,
				seriesId,
				seriesNumber: 1,
			});

			// Act
			const response = await player.agent.get(entriesUrl(seriesId));

			// Assert
			expect(
				(response.body as { entries: { gameId: number }[] }).entries.map(
					({ gameId }) => gameId,
				),
			).toStrictEqual([mine.gameId]);
		});

		it("SHOULD give the backlog games of the series by number, with their names and release date", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: "Metroid",
			});
			const later = await seedBacklogGame({
				userId: player.userId,
				name: "Metroid Prime",
				frenchName: "Metroid Prime (FR)",
				firstReleaseDate: "2002-11-17",
				seriesId,
				seriesNumber: 4.1,
			});
			const earlier = await seedBacklogGame({
				userId: player.userId,
				name: "Super Metroid",
				firstReleaseDate: "1994-03-19",
				seriesId,
				seriesNumber: 3,
			});

			// Act
			const response = await player.agent.get(entriesUrl(seriesId));

			// Assert
			expect(response.body).toStrictEqual({
				entries: [
					{
						gameId: earlier.gameId,
						seriesNumber: 3,
						name: "Super Metroid",
						frenchName: null,
						firstReleaseDate: "1994-03-19",
					},
					{
						gameId: later.gameId,
						seriesNumber: 4.1,
						name: "Metroid Prime",
						frenchName: "Metroid Prime (FR)",
						firstReleaseDate: "2002-11-17",
					},
				],
			});
		});
	});

	describe("204 No Content", () => {
		it("SHOULD answer without body WHEN no backlog game is in the series", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: "Empty",
			});

			// Act
			const response = await player.agent.get(entriesUrl(seriesId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the series does not exist WHEN another account created it", async () => {
			// Arrange
			const other = await openSignedInAgent();
			const seriesId = await insertBacklogRows.series({
				userId: other.userId,
				name: "Private",
			});

			// Act
			const response = await player.agent.get(entriesUrl(seriesId));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.SERIES_NOT_FOUND,
				`No series with id : ${seriesId}`,
			);
		});

		it("SHOULD answer that the series does not exist", async () => {
			// Act
			const response = await player.agent.get(entriesUrl(NON_EXISTENT_ID));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.SERIES_NOT_FOUND,
				`No series with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(entriesUrl(1));

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

const SERIES_URL = `${ApiPrefixEnum.BACKLOG}/series`;

function entriesUrl(seriesId: number): string {
	return `${SERIES_URL}/${seriesId}/entries`;
}

describe("reorderSeries", () => {
	describe("200 OK", () => {
		it("SHOULD renumber only the games of the account WHEN the IGDB series is shared", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				name: "Castlevania",
				igdbCollectionId: await nextIgdbId(),
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
			const other = await openSignedInAgent();
			const others = await seedBacklogGame({
				userId: other.userId,
				seriesId,
				seriesNumber: 1,
			});

			// Act
			const response = await player.agent.put(entriesUrl(seriesId)).send({
				entries: [
					{ gameId: first.gameId, seriesNumber: 2 },
					{ gameId: second.gameId, seriesNumber: 1 },
				],
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(await selectBacklogRows.userGame(other.userId, others.gameId))
					?.seriesNumber,
			).toBe(1);
		});

		it("SHOULD save the new numbers of every game of the series", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: "Castlevania",
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

			// Act
			const response = await player.agent.put(entriesUrl(seriesId)).send({
				entries: [
					{ gameId: first.gameId, seriesNumber: 2 },
					{ gameId: second.gameId, seriesNumber: 1.5 },
				],
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(await selectBacklogRows.userGame(player.userId, first.gameId))
					?.seriesNumber,
			).toBe(2);
			expect(
				(await selectBacklogRows.userGame(player.userId, second.gameId))
					?.seriesNumber,
			).toBe(1.5);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD reject the same number given twice", async () => {
			// Act
			const response = await player.agent.put(entriesUrl(42)).send({
				entries: [
					{ gameId: 1, seriesNumber: 2 },
					{ gameId: 2, seriesNumber: 2 },
				],
			});

			// Assert
			expectValidationError(response, [
				{
					path: ["entries"],
					code: ValidationIssueCodeEnum.DUPLICATE_VALUE,
					message: "Entries should not give the same number twice",
				},
			]);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse entries that are not exactly the games of the series, and change nothing", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({
				userId: player.userId,
				name: "Kirby",
			});
			const inSeries = await seedBacklogGame({
				userId: player.userId,
				seriesId,
				seriesNumber: 1,
			});
			await seedBacklogGame({
				userId: player.userId,
				seriesId,
				seriesNumber: 2,
			});

			// Act
			const response = await player.agent
				.put(entriesUrl(seriesId))
				.send({ entries: [{ gameId: inSeries.gameId, seriesNumber: 5 }] });

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.SERIES_ENTRIES_MISMATCH,
				`Entries are not the backlog games of series : ${seriesId}`,
			);
			expect(
				(await selectBacklogRows.userGame(player.userId, inSeries.gameId))
					?.seriesNumber,
			).toBe(1);
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
			const others = await seedBacklogGame({
				userId: other.userId,
				seriesId,
				seriesNumber: 1,
			});

			// Act
			const response = await player.agent.put(entriesUrl(seriesId)).send({
				entries: [{ gameId: others.gameId, seriesNumber: 2 }],
			});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.SERIES_NOT_FOUND,
				`No series with id : ${seriesId}`,
			);
			expect(
				(await selectBacklogRows.userGame(other.userId, others.gameId))
					?.seriesNumber,
			).toBe(1);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app)
				.put(entriesUrl(1))
				.send({ entries: [] });

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

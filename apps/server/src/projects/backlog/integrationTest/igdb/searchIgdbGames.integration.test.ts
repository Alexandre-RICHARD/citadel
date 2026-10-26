import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { BadGatewayError } from "../../../../error/BadGatewayError.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { igdbGateway } from "../../igdb/igdbGateway.ts";

const SEARCH_URL = `${ApiPrefixEnum.BACKLOG}/igdb/search`;

describe("searchIgdbGames", () => {
	describe("200 OK", () => {
		it("SHOULD give each hit with its names, year, cover and platforms", async () => {
			// Arrange
			const igdbId = await nextIgdbId();
			vi.spyOn(igdbGateway, "searchGames").mockResolvedValueOnce([
				{
					game: {
						id: igdbId,
						name: "Brain Age",
						alternative_names: [
							{
								id: 1,
								name: " Programme d'entraînement cérébral ",
								comment: "French title",
							},
						],
						first_release_date: Date.parse("2005-05-19T00:00:00Z") / 1000,
						cover: { image_id: "co2xyz" },
						platforms: [
							{ name: "Nintendo DS", abbreviation: "NDS" },
							{ name: "Wii U" },
						],
					},
					matchedName: "Brain Age: Train Your Brain in Minutes a Day!",
				},
			]);

			// Act
			const response = await request(app)
				.get(SEARCH_URL)
				.query({ query: "brain age" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				results: [
					{
						igdbId,
						name: "Brain Age",
						frenchName: "Programme d'entraînement cérébral",
						matchedName: "Brain Age: Train Your Brain in Minutes a Day!",
						releaseYear: 2005,
						coverImageId: "co2xyz",
						platformNames: ["NDS", "Wii U"],
						storedGameId: null,
						isInBacklog: false,
					},
				],
			});
		});

		it("SHOULD flag a hit already stored, and whether its game is in the backlog", async () => {
			// Arrange
			const inBacklog = await seedStoredGame();
			await insertBacklogRows.userGame({ gameId: inBacklog.gameId });
			const storedOnly = await seedStoredGame({
				otherVersionTitles: ["Special Edition"],
			});
			vi.spyOn(igdbGateway, "searchGames").mockResolvedValueOnce([
				{ game: { id: inBacklog.gameId, name: "Skyrim" }, matchedName: null },
				// Une version en base mène à son jeu
				{
					game: { id: storedOnly.versionIds[1] ?? 0, name: "Skyrim SE" },
					matchedName: null,
				},
			]);

			// Act
			const response = await request(app)
				.get(SEARCH_URL)
				.query({ query: "skyrim" });

			// Assert
			expect(response.body).toMatchObject({
				results: [
					{ storedGameId: inBacklog.gameId, isInBacklog: true },
					{ storedGameId: storedOnly.gameId, isInBacklog: false },
				],
			});
		});
	});

	describe("204 No Content", () => {
		it("SHOULD answer without body WHEN IGDB finds nothing", async () => {
			// Arrange
			vi.spyOn(igdbGateway, "searchGames").mockResolvedValueOnce([]);

			// Act
			const response = await request(app)
				.get(SEARCH_URL)
				.query({ query: "zzzz" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(response.body).toStrictEqual({});
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD reject the request WHEN the query is only spaces", async () => {
			// Act
			const response = await request(app)
				.get(SEARCH_URL)
				.query({ query: "  " });

			// Assert
			expectValidationError(response, [
				{
					path: ["query"],
					code: ValidationIssueCodeEnum.TOO_SHORT,
					limit: 1,
					message: "Query should contain at least 1 character",
				},
			]);
		});

		it("SHOULD reject the request WHEN there is no query", async () => {
			// Act
			const response = await request(app).get(SEARCH_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
		});
	});

	describe("502 Bad Gateway", () => {
		it("SHOULD keep the IGDB code and log the failure WHEN IGDB does not answer", async () => {
			// Arrange
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(igdbGateway, "searchGames").mockRejectedValueOnce(
				new BadGatewayError(
					BacklogErrorCodeEnum.IGDB_UNAVAILABLE,
					"IGDB answered 503 on games",
				),
			);

			// Act
			const response = await request(app)
				.get(SEARCH_URL)
				.query({ query: "skyrim" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_GATEWAY);
			expect(response.body).toStrictEqual({
				code: BacklogErrorCodeEnum.IGDB_UNAVAILABLE,
				message: "IGDB answered 503 on games",
			});
			await errorLogWatcher.expectLogged({
				errorType: "BadGatewayError",
				message: `[GET ${SEARCH_URL}?query=skyrim] IGDB answered 503 on games`,
			});
		});
	});
});

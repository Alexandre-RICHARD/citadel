import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { BadGatewayError } from "../../../../error/BadGatewayError.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { tmdbGateway } from "../../tmdb/tmdbGateway.ts";

const SEARCH_URL = `${ApiPrefixEnum.BACKLOG}/tmdb/search`;

describe("searchTmdbMedia", () => {
	describe("200 OK", () => {
		it("SHOULD give movies and shows, each with its row in the backlog of the account", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const sharedId = await nextTmdbId();
			await insertMediaRows.movie({ id: sharedId, title: "Dune" });
			const userMediaId = await insertMediaRows.userMedia({
				userId: account.userId,
				movieId: sharedId,
			});
			const hit = {
				title: "Dune",
				originalTitle: "Dune",
				date: "2021-09-15",
				posterPath: null,
			};
			vi.spyOn(tmdbGateway, "searchMedia").mockResolvedValueOnce([
				{ ...hit, mediaType: MediaTypeEnum.MOVIE, tmdbId: sharedId },
				{ ...hit, mediaType: MediaTypeEnum.SHOW, tmdbId: sharedId },
			]);

			// Act
			const response = await account.agent
				.get(SEARCH_URL)
				.query({ query: "dune" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual([
				{
					...hit,
					mediaType: MediaTypeEnum.MOVIE,
					tmdbId: sharedId,
					userMediaId,
				},
				{
					...hit,
					mediaType: MediaTypeEnum.SHOW,
					tmdbId: sharedId,
					userMediaId: null,
				},
			]);
		});
	});

	describe("204 No Content", () => {
		it("SHOULD answer with no content WHEN TMDB finds nothing", async () => {
			// Arrange
			const account = await openSignedInAgent();
			vi.spyOn(tmdbGateway, "searchMedia").mockResolvedValueOnce([]);

			// Act
			const response = await account.agent
				.get(SEARCH_URL)
				.query({ query: "zzz" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});
	});

	describe("502 Bad Gateway", () => {
		it("SHOULD say that TMDB is unavailable", async () => {
			// Arrange
			const account = await openSignedInAgent();
			vi.spyOn(tmdbGateway, "searchMedia").mockRejectedValueOnce(
				new BadGatewayError(
					BacklogErrorCodeEnum.TMDB_UNAVAILABLE,
					"TMDB did not answer on /search/multi",
				),
			);

			// Act
			const response = await account.agent
				.get(SEARCH_URL)
				.query({ query: "dune" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_GATEWAY);
			expect(response.body).toMatchObject({
				code: BacklogErrorCodeEnum.TMDB_UNAVAILABLE,
			});
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app)
				.get(SEARCH_URL)
				.query({ query: "dune" });

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { buildTmdbMovieData } from "../../../../testUtils/integration/backlog/buildTmdbMovieData.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { tmdbGateway } from "../../tmdb/tmdbGateway.ts";

function previewUrl(tmdbId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/tmdb/movies/${tmdbId}`;
}

describe("getMoviePreview", () => {
	describe("200 OK", () => {
		it("SHOULD propose a new saga named after the collection WHEN no saga of the account is linked to it", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const tmdbId = await nextTmdbId();
			const collection = { id: await nextTmdbId(), name: "Alien - Saga" };
			vi.spyOn(tmdbGateway, "fetchMovie").mockResolvedValueOnce(
				buildTmdbMovieData({ id: tmdbId, title: "Alien", collection }),
			);

			// Act
			const response = await account.agent.get(previewUrl(tmdbId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				tmdbId,
				title: "Alien",
				originalTitle: "Dune",
				originalLanguage: "en",
				releaseDate: "2021-09-15",
				runtimeMinutes: 156,
				posterPath: "/dune.jpg",
				collection,
				proposedSaga: { sagaId: null, name: "Alien - Saga" },
				userMediaId: null,
			});
		});

		it("SHOULD propose the saga of the account linked to the collection", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const tmdbId = await nextTmdbId();
			const collection = { id: await nextTmdbId(), name: "Alien - Saga" };
			await insertMediaRows.collection(collection);
			const sagaId = await insertMediaRows.saga({
				userId: account.userId,
				name: "Alien",
			});
			await insertMediaRows.sagaCollection({
				userId: account.userId,
				collectionId: collection.id,
				sagaId,
			});
			vi.spyOn(tmdbGateway, "fetchMovie").mockResolvedValueOnce(
				buildTmdbMovieData({ id: tmdbId, collection }),
			);

			// Act
			const response = await account.agent.get(previewUrl(tmdbId));

			// Assert
			expect(response.body).toMatchObject({
				proposedSaga: { sagaId, name: "Alien" },
			});
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that TMDB does not know the movie", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const tmdbId = await nextTmdbId();
			vi.spyOn(tmdbGateway, "fetchMovie").mockResolvedValueOnce(null);

			// Act
			const response = await account.agent.get(previewUrl(tmdbId));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.TMDB_MEDIA_NOT_FOUND,
				`No movie on TMDB with id : ${tmdbId}`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(previewUrl(603));

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

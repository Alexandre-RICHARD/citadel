import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { buildTmdbMovieData } from "../../../../testUtils/integration/backlog/buildTmdbMovieData.ts";
import { buildTmdbShowData } from "../../../../testUtils/integration/backlog/buildTmdbShowData.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { selectMediaRows } from "../../../../testUtils/integration/backlog/selectMediaRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { tmdbGateway } from "../../tmdb/tmdbGateway.ts";

const CREATE_URL = `${ApiPrefixEnum.BACKLOG}/user-media`;
const FUTURE = "2999-01-01";

let viewer: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	viewer = await openSignedInAgent();
});

function noSaga() {
	return {
		imagePath: null,
		saga: { kind: SagaChoiceKindEnum.NONE },
		sagaNumber: null,
	};
}

describe("createUserMedia", () => {
	describe("201 Created", () => {
		it("SHOULD store a movie read on TMDB and add it with its customization", async () => {
			// Arrange
			const tmdbId = await nextTmdbId();
			vi.spyOn(tmdbGateway, "fetchMovie").mockResolvedValueOnce(
				buildTmdbMovieData({
					id: tmdbId,
					title: "Dune",
					originalTitle: "Dune",
				}),
			);

			// Act
			const response = await viewer.agent.post(CREATE_URL).send({
				mediaType: MediaTypeEnum.MOVIE,
				tmdbId,
				customization: { ...noSaga(), imagePath: "/other-poster.jpg" },
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect(response.body).toStrictEqual({
				id: expect.any(Number) as number,
				mediaType: MediaTypeEnum.MOVIE,
				tmdbId,
				title: "Dune",
				originalTitle: "Dune",
				originalLanguage: "en",
				releaseDate: "2021-09-15",
				runtimeMinutes: 156,
				imagePath: "/other-poster.jpg",
				saga: null,
				sagaNumber: null,
				isWatched: false,
				watchedEpisodeCount: 0,
				airedEpisodeCount: 0,
				isUpNext: false,
				isInProgress: false,
				comment: null,
				createdAt: expect.any(String) as string,
				updatedAt: expect.any(String) as string,
			});
			expect(await selectMediaRows.movieExists(tmdbId)).toBe(true);
		});

		it("SHOULD not read TMDB WHEN the movie is already stored by another account", async () => {
			// Arrange
			const tmdbId = await nextTmdbId();
			await insertMediaRows.movie({ id: tmdbId, title: "Alien" });
			const fetchMovie = vi.spyOn(tmdbGateway, "fetchMovie");

			// Act
			const response = await viewer.agent.post(CREATE_URL).send({
				mediaType: MediaTypeEnum.MOVIE,
				tmdbId,
				customization: noSaga(),
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect(response.body).toMatchObject({ title: "Alien" });
			expect(fetchMovie).not.toHaveBeenCalled();
		});

		it("SHOULD store a show with all its seasons and episodes, and count only the aired ones of the main seasons", async () => {
			// Arrange
			const show = await buildTmdbShowData({
				withSpecials: true,
				seasons: [
					{ airDates: ["2018-01-01"] },
					{ airDates: ["2017-12-01", "2017-12-08"] },
					{ airDates: ["2019-06-21", FUTURE] },
				],
			});
			vi.spyOn(tmdbGateway, "fetchShow").mockResolvedValueOnce(show);

			// Act
			const response = await viewer.agent.post(CREATE_URL).send({
				mediaType: MediaTypeEnum.SHOW,
				tmdbId: show.id,
				customization: noSaga(),
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect(response.body).toMatchObject({
				mediaType: MediaTypeEnum.SHOW,
				title: "Dark",
				releaseDate: "2017-12-01",
				runtimeMinutes: 200,
				isWatched: false,
				watchedEpisodeCount: 0,
				airedEpisodeCount: 3,
			});
			expect(await selectMediaRows.episodeIdsOfShow(show.id)).toHaveLength(5);
		});

		it("SHOULD create the saga named after the collection, link it, and number the next movie after the first", async () => {
			// Arrange
			const collection = { id: await nextTmdbId(), name: "Dune - Saga" };
			const firstId = await nextTmdbId();
			const secondId = await nextTmdbId();
			vi.spyOn(tmdbGateway, "fetchMovie")
				.mockResolvedValueOnce(buildTmdbMovieData({ id: firstId, collection }))
				.mockResolvedValueOnce(
					buildTmdbMovieData({ id: secondId, collection }),
				);
			const proposed = {
				imagePath: null,
				saga: { kind: SagaChoiceKindEnum.PROPOSED },
				sagaNumber: null,
			};

			// Act
			const first = await viewer.agent.post(CREATE_URL).send({
				mediaType: MediaTypeEnum.MOVIE,
				tmdbId: firstId,
				customization: proposed,
			});
			const second = await viewer.agent.post(CREATE_URL).send({
				mediaType: MediaTypeEnum.MOVIE,
				tmdbId: secondId,
				customization: proposed,
			});

			// Assert
			const body = first.body as { saga: { id: number; name: string } };
			expect(body.saga.name).toBe("Dune - Saga");
			expect(first.body).toMatchObject({ sagaNumber: 1 });
			expect(second.body).toMatchObject({ saga: body.saga, sagaNumber: 2 });
			expect(
				await selectMediaRows.sagaOfCollection(viewer.userId, collection.id),
			).toBe(body.saga.id);
		});

		it("SHOULD join the existing saga WHEN a new saga has a taken name, without accents or case", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const sagaId = await insertMediaRows.saga({
				userId: account.userId,
				name: "Le Seigneur des anneaux",
			});
			const tmdbId = await nextTmdbId();
			await insertMediaRows.movie({ id: tmdbId, title: "Le Hobbit" });

			// Act
			const response = await account.agent.post(CREATE_URL).send({
				mediaType: MediaTypeEnum.MOVIE,
				tmdbId,
				customization: {
					imagePath: null,
					saga: {
						kind: SagaChoiceKindEnum.NEW,
						name: "le seigneur des ANNEAUX",
					},
					sagaNumber: 3.1,
				},
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect(response.body).toMatchObject({
				saga: { id: sagaId, name: "Le Seigneur des anneaux" },
				sagaNumber: 3.1,
			});
			expect(await selectMediaRows.sagaNames(account.userId)).toStrictEqual([
				"Le Seigneur des anneaux",
			]);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that TMDB does not know the media, and add nothing", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const tmdbId = await nextTmdbId();
			vi.spyOn(tmdbGateway, "fetchShow").mockResolvedValueOnce(null);

			// Act
			const response = await account.agent.post(CREATE_URL).send({
				mediaType: MediaTypeEnum.SHOW,
				tmdbId,
				customization: noSaga(),
			});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.TMDB_MEDIA_NOT_FOUND,
				`No show on TMDB with id : ${tmdbId}`,
			);
			expect(await selectMediaRows.userMediaIds(account.userId)).toStrictEqual(
				[],
			);
		});

		it("SHOULD refuse a saga of another account, and add nothing", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const stranger = await openSignedInAgent();
			const sagaId = await insertMediaRows.saga({
				userId: stranger.userId,
				name: "Alien",
			});
			const tmdbId = await nextTmdbId();
			await insertMediaRows.movie({ id: tmdbId, title: "Aliens" });

			// Act
			const response = await account.agent.post(CREATE_URL).send({
				mediaType: MediaTypeEnum.MOVIE,
				tmdbId,
				customization: {
					imagePath: null,
					saga: { kind: SagaChoiceKindEnum.OTHER, sagaId },
					sagaNumber: null,
				},
			});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.SAGA_NOT_FOUND,
				`No saga with id : ${sagaId}`,
			);
			expect(await selectMediaRows.userMediaIds(account.userId)).toStrictEqual(
				[],
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse a media already in the backlog", async () => {
			// Arrange
			const tmdbId = await nextTmdbId();
			await insertMediaRows.movie({ id: tmdbId, title: "Heat" });
			await insertMediaRows.userMedia({
				userId: viewer.userId,
				movieId: tmdbId,
			});

			// Act
			const response = await viewer.agent.post(CREATE_URL).send({
				mediaType: MediaTypeEnum.MOVIE,
				tmdbId,
				customization: noSaga(),
			});

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.USER_MEDIA_ALREADY_EXISTS,
				`movie already in the backlog : ${tmdbId}`,
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

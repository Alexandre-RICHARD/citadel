import { MediaImportRejectionEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportRejection.enum.ts";
import { MediaImportStatusEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportStatus.enum.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

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
import type { TmdbMovieData } from "../../tmdb/type/tmdbMovieData.type.ts";

const IMPORTS_URL = `${ApiPrefixEnum.BACKLOG}/media-imports`;
const CURRENT_URL = `${IMPORTS_URL}/current`;
const VALIDATION_URL = `${CURRENT_URL}/validation`;

type Agent = Awaited<ReturnType<typeof openSignedInAgent>>["agent"];

// La lecture se fait en arrière-plan : l'import est relu jusqu'à ce qu'il ne lise plus
async function waitWhileReading(agent: Agent): Promise<request.Response> {
	for (let attempt = 0; attempt < 50; attempt += 1) {
		// eslint-disable-next-line no-await-in-loop -- chaque lecture attend la précédente
		const response = await agent.get(CURRENT_URL);
		if (
			(response.body as { status?: string }).status !==
			MediaImportStatusEnum.READING
		)
			return response;
		// eslint-disable-next-line no-await-in-loop -- idem
		await new Promise((resolve) => {
			setTimeout(resolve, 20);
		});
	}
	throw new Error("The media import is still reading");
}

// Une lecture TMDB qui ne finit que sur demande, pour garder un import en cours de lecture
function holdMovieFetch() {
	const { promise, resolve } = Promise.withResolvers<TmdbMovieData | null>();
	vi.spyOn(tmdbGateway, "fetchFreshMovie").mockReturnValueOnce(promise);
	return function release(): void {
		resolve(null);
	};
}

describe("mediaImports", () => {
	describe("201 Created, then 200 OK", () => {
		it("SHOULD read the list, sort it out in the preview, and add the recognized media on validation", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const newMovieId = await nextTmdbId();
			const storedMovieId = await nextTmdbId();
			const ownedMovieId = await nextTmdbId();
			const unknownId = await nextTmdbId();
			await insertMediaRows.movie({
				id: storedMovieId,
				title: "Alien",
				posterPath: "/alien.jpg",
			});
			await insertMediaRows.movie({ id: ownedMovieId, title: "Heat" });
			await insertMediaRows.userMedia({
				userId: account.userId,
				movieId: ownedMovieId,
			});
			const show = await buildTmdbShowData({
				seasons: [{ airDates: ["2017-12-01"] }],
			});
			const fetchFreshMovie = vi
				.spyOn(tmdbGateway, "fetchFreshMovie")
				.mockImplementation((tmdbId) =>
					Promise.resolve(
						tmdbId === newMovieId
							? buildTmdbMovieData({ id: newMovieId, title: "Dune" })
							: null,
					),
				);
			vi.spyOn(tmdbGateway, "fetchFreshShow").mockResolvedValueOnce(show);
			const entries = [
				{ mediaType: MediaTypeEnum.MOVIE, tmdbId: newMovieId },
				{ mediaType: MediaTypeEnum.MOVIE, tmdbId: storedMovieId },
				{ mediaType: MediaTypeEnum.MOVIE, tmdbId: ownedMovieId },
				{ mediaType: MediaTypeEnum.MOVIE, tmdbId: newMovieId },
				{ mediaType: MediaTypeEnum.MOVIE, tmdbId: unknownId },
				{ mediaType: MediaTypeEnum.SHOW, tmdbId: show.id },
			];

			// Act
			const started = await account.agent.post(IMPORTS_URL).send({ entries });
			const preview = await waitWhileReading(account.agent);
			const validated = await account.agent.post(VALIDATION_URL);

			// Assert
			expect(started.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect(started.body).toMatchObject({ totalCount: 6, recognized: [] });
			expect(preview.body).toMatchObject({
				status: MediaImportStatusEnum.READY,
				readCount: 6,
				totalCount: 6,
			});
			const body = preview.body as {
				recognized: { tmdbId: number }[];
				rejected: { tmdbId: number; reason: string }[];
			};
			expect(body.recognized.map(({ tmdbId }) => tmdbId).sort()).toStrictEqual(
				[newMovieId, storedMovieId, show.id].sort(),
			);
			expect(body.rejected).toStrictEqual(
				expect.arrayContaining([
					{
						mediaType: MediaTypeEnum.MOVIE,
						tmdbId: ownedMovieId,
						reason: MediaImportRejectionEnum.ALREADY_IN_BACKLOG,
					},
					{
						mediaType: MediaTypeEnum.MOVIE,
						tmdbId: newMovieId,
						reason: MediaImportRejectionEnum.DUPLICATE,
					},
					{
						mediaType: MediaTypeEnum.MOVIE,
						tmdbId: unknownId,
						reason: MediaImportRejectionEnum.TMDB_NOT_FOUND,
					},
				]) as unknown,
			);
			expect(fetchFreshMovie).not.toHaveBeenCalledWith(storedMovieId);
			expect(validated.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(validated.body).toStrictEqual({ addedCount: 3 });
			expect(await selectMediaRows.userMediaIds(account.userId)).toHaveLength(
				4,
			);
			expect(await selectMediaRows.episodeIdsOfShow(show.id)).toHaveLength(1);
			expectNotFound(
				await account.agent.get(CURRENT_URL),
				BacklogErrorCodeEnum.MEDIA_IMPORT_NOT_FOUND,
				`No media import for user : ${account.userId}`,
			);
		});
	});

	describe("204 No Content", () => {
		it("SHOULD cancel the import, and add nothing", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const release = holdMovieFetch();
			await account.agent.post(IMPORTS_URL).send({
				entries: [
					{ mediaType: MediaTypeEnum.MOVIE, tmdbId: await nextTmdbId() },
				],
			});

			// Act
			const response = await account.agent.delete(CURRENT_URL);
			release();

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect((await account.agent.get(CURRENT_URL)).status).toBe(404);
			expect(await selectMediaRows.userMediaIds(account.userId)).toStrictEqual(
				[],
			);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the account has no import", async () => {
			// Arrange
			const account = await openSignedInAgent();

			// Act
			const response = await account.agent.post(VALIDATION_URL);

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.MEDIA_IMPORT_NOT_FOUND,
				`No media import for user : ${account.userId}`,
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse a second import and a validation WHEN the first is still reading", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const release = holdMovieFetch();
			const entries = [
				{ mediaType: MediaTypeEnum.MOVIE, tmdbId: await nextTmdbId() },
			];
			await account.agent.post(IMPORTS_URL).send({ entries });

			// Act
			const second = await account.agent.post(IMPORTS_URL).send({ entries });
			const validation = await account.agent.post(VALIDATION_URL);
			release();

			// Assert
			expectConflict(
				second,
				BacklogErrorCodeEnum.MEDIA_IMPORT_ALREADY_RUNNING,
				`A media import is already running for user : ${account.userId}`,
			);
			expectConflict(
				validation,
				BacklogErrorCodeEnum.MEDIA_IMPORT_NOT_READY,
				`The media import of user ${account.userId} is reading`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(CURRENT_URL);

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

import type { UserMediaListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaListDto.type.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { seedBacklogShow } from "../../../../testUtils/integration/backlog/seedBacklogShow.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";

const USER_MEDIA_URL = `${ApiPrefixEnum.BACKLOG}/user-media`;

function titles(body: unknown): string[] {
	return (body as UserMediaListDto).userMedia.map(({ title }) => title);
}

// Un film en base et dans le backlog du compte
async function seedBacklogMovie(
	userId: number,
	movie: {
		title: string;
		releaseDate?: string;
		runtimeMinutes?: number;
	},
	userMedia: { isWatched?: boolean } = {},
): Promise<{ movieId: number; userMediaId: number }> {
	const movieId = await nextTmdbId();
	await insertMediaRows.movie({ id: movieId, ...movie });
	const userMediaId = await insertMediaRows.userMedia({
		userId,
		movieId,
		...userMedia,
	});
	return { movieId, userMediaId };
}

describe("getAllUserMedia", () => {
	describe("200 OK", () => {
		it("SHOULD give each row with its show progress, and the summary of the whole backlog", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const stranger = await openSignedInAgent();
			const { movieId } = await seedBacklogMovie(account.userId, {
				title: "Alien",
				releaseDate: "1979-05-25",
				runtimeMinutes: 117,
			});
			const show = await seedBacklogShow({ episodeCounts: [1, 3] });
			const showMediaId = await insertMediaRows.userMedia({
				userId: account.userId,
				tvShowId: show.tvShowId,
			});
			const [[specialId = 0] = [], [firstId = 0] = []] = show.episodeIds;
			await insertMediaRows.watchedEpisode({
				userId: account.userId,
				tvEpisodeId: firstId,
			});
			// Un épisode spécial vu ne compte pas dans la progression
			await insertMediaRows.watchedEpisode({
				userId: account.userId,
				tvEpisodeId: specialId,
			});
			await seedBacklogMovie(stranger.userId, { title: "Batman" });

			// Act
			const response = await account.agent.get(USER_MEDIA_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const body = response.body as UserMediaListDto;
			expect(body.matchedCount).toBe(2);
			expect(body.movieCount).toBe(1);
			expect(body.showCount).toBe(1);
			expect(body.originalLanguages).toStrictEqual(["en"]);
			expect(body.userMedia.find(({ tmdbId }) => tmdbId === movieId)).toEqual(
				expect.objectContaining({
					mediaType: MediaTypeEnum.MOVIE,
					title: "Alien",
					releaseDate: "1979-05-25",
					runtimeMinutes: 117,
					isWatched: false,
				}),
			);
			expect(body.userMedia.find(({ id }) => id === showMediaId)).toEqual(
				expect.objectContaining({
					mediaType: MediaTypeEnum.SHOW,
					watchedEpisodeCount: 1,
					airedEpisodeCount: 3,
					runtimeMinutes: 150,
					isWatched: false,
				}),
			);
		});

		it("SHOULD filter and sort the rows like the games table", async () => {
			// Arrange
			const account = await openSignedInAgent();
			await seedBacklogMovie(account.userId, {
				title: "Alien",
				releaseDate: "1979-05-25",
			});
			await seedBacklogMovie(
				account.userId,
				{ title: "Aliens", releaseDate: "1986-07-18" },
				{ isWatched: true },
			);
			await seedBacklogMovie(account.userId, {
				title: "Heat",
				releaseDate: "1995-12-15",
			});

			// Act
			const sorted = await account.agent
				.get(USER_MEDIA_URL)
				.query({ title: "alien", sort: "releaseDate:desc" });
			const watched = await account.agent
				.get(USER_MEDIA_URL)
				.query({ watched: "yes" });
			const either = await account.agent
				.get(USER_MEDIA_URL)
				.query({ watched: "yes", title: "heat", filterMode: "or" });

			// Assert
			expect(titles(sorted.body)).toStrictEqual(["Aliens", "Alien"]);
			expect((sorted.body as UserMediaListDto).matchedCount).toBe(2);
			expect(titles(watched.body)).toStrictEqual(["Aliens"]);
			expect(titles(either.body).toSorted()).toStrictEqual(["Aliens", "Heat"]);
		});

		it("SHOULD keep the summary WHEN no row matches the filters", async () => {
			// Arrange
			const account = await openSignedInAgent();
			await seedBacklogMovie(account.userId, { title: "Alien" });

			// Act
			const response = await account.agent
				.get(USER_MEDIA_URL)
				.query({ title: "nothing like this" });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				userMedia: [],
				matchedCount: 0,
				movieCount: 1,
				showCount: 0,
				originalLanguages: ["en"],
			});
		});
	});

	describe("204 No Content", () => {
		it("SHOULD answer with no content WHEN the backlog has no media", async () => {
			// Arrange
			const account = await openSignedInAgent();

			// Act
			const response = await account.agent.get(USER_MEDIA_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD reject an unreadable filter", async () => {
			// Arrange
			const account = await openSignedInAgent();

			// Act
			const response = await account.agent
				.get(USER_MEDIA_URL)
				.query({ watched: "maybe" });

			// Assert
			expectValidationError(response, [
				{
					path: ["watched"],
					code: ValidationIssueCodeEnum.INVALID_VALUE,
					message:
						'watched filter is not readable (e.g. "zelda", "=The Witcher", "finished", "yes", "10..18", "2020-01-01..")',
				},
			]);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(USER_MEDIA_URL);

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

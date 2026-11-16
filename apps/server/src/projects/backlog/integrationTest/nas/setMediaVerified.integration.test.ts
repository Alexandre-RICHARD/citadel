import type { ConnectedUserMediaListDto } from "@citadel/specs/src/projects/backlog/dto/nas/connectedUserMediaListDto.type.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import { describe, expect, it } from "vitest";

import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { buildSurveyedShow } from "../../../../testUtils/integration/backlog/nas/buildSurveyedShow.ts";
import { openUnlockedNasAgent } from "../../../../testUtils/integration/backlog/nas/openUnlockedNasAgent.ts";
import { writeTestSurvey } from "../../../../testUtils/integration/backlog/nas/writeTestSurvey.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { seedBacklogShow } from "../../../../testUtils/integration/backlog/seedBacklogShow.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { buildSurveyedMovie } from "../../../../testUtils/unit/backlog/buildSurveyedMovie.ts";

function verifiedUrl(userMediaId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/nas/user-media/${userMediaId}/verified`;
}

async function addMovie(userId: number) {
	const movieId = await nextTmdbId();
	await insertMediaRows.movie({ id: movieId, title: `Film ${movieId}` });
	const userMediaId = await insertMediaRows.userMedia({ userId, movieId });
	return { movieId, userMediaId };
}

async function readVerified(
	agent: Awaited<ReturnType<typeof openUnlockedNasAgent>>["agent"],
) {
	const response = await agent.get(`${ApiPrefixEnum.BACKLOG}/nas/user-media`);
	return (response.body as ConnectedUserMediaListDto).userMedia.map(
		({ nas }) => `${nas.verifiedCount}/${nas.verifiableCount}`,
	);
}

describe("setMediaVerified", () => {
	describe("204 No Content", () => {
		it("SHOULD verify a movie's file, then uncheck it", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const { movieId, userMediaId } = await addMovie(owner.userId);
			writeTestSurvey({ movies: [buildSurveyedMovie(movieId)] });

			// Act
			const checked = await owner.agent
				.put(verifiedUrl(userMediaId))
				.send({ episodeIds: null, isVerified: true });
			const afterCheck = await readVerified(owner.agent);
			await owner.agent
				.put(verifiedUrl(userMediaId))
				.send({ episodeIds: null, isVerified: false });

			// Assert
			expect(checked.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(afterCheck).toStrictEqual(["1/1"]);
			expect(await readVerified(owner.agent)).toStrictEqual(["0/1"]);
		});

		it("SHOULD no longer count a case WHEN the job finds another file", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const { movieId, userMediaId } = await addMovie(owner.userId);
			writeTestSurvey({ movies: [buildSurveyedMovie(movieId)] });
			await owner.agent
				.put(verifiedUrl(userMediaId))
				.send({ episodeIds: null, isVerified: true });

			// Act
			writeTestSurvey(
				{ movies: [buildSurveyedMovie(movieId, { inode: 1 })] },
				{ keepVerifications: true },
			);

			// Assert
			expect(await readVerified(owner.agent)).toStrictEqual(["0/1"]);
		});

		it("SHOULD verify the episodes of a show, skipping those without a file", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const show = await seedBacklogShow({ episodeCounts: [0, 2] });
			const userMediaId = await insertMediaRows.userMedia({
				userId: owner.userId,
				tvShowId: show.tvShowId,
			});
			writeTestSurvey({ shows: [buildSurveyedShow(show.tvShowId, [[1, 1]])] });

			// Act
			const response = await owner.agent
				.put(verifiedUrl(userMediaId))
				.send({ episodeIds: show.episodeIds[1], isVerified: true });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(await readVerified(owner.agent)).toStrictEqual(["1/1"]);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD refuse WHEN an episode is not in this show", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const show = await seedBacklogShow({ episodeCounts: [0, 1] });
			const userMediaId = await insertMediaRows.userMedia({
				userId: owner.userId,
				tvShowId: show.tvShowId,
			});
			writeTestSurvey({});
			const strangerId = await nextTmdbId();

			// Act
			const response = await owner.agent
				.put(verifiedUrl(userMediaId))
				.send({ episodeIds: [strangerId], isVerified: true });

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.EPISODE_NOT_IN_SHOW,
				`Episode ${strangerId} is not in this show`,
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse WHEN the movie has no file on the NAS", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const { userMediaId } = await addMovie(owner.userId);
			writeTestSurvey({});

			// Act
			const response = await owner.agent
				.put(verifiedUrl(userMediaId))
				.send({ episodeIds: null, isVerified: true });

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER,
			);
			expect(response.body).toStrictEqual({
				code: BacklogErrorCodeEnum.NOT_VERIFIABLE,
				message: "No single file to verify",
			});
		});

		it("SHOULD refuse WHEN the movie has two files", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const { movieId, userMediaId } = await addMovie(owner.userId);
			writeTestSurvey({
				movies: [buildSurveyedMovie(movieId, { fileCount: 2 })],
			});

			// Act
			const response = await owner.agent
				.put(verifiedUrl(userMediaId))
				.send({ episodeIds: null, isVerified: true });

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER,
			);
		});
	});
});

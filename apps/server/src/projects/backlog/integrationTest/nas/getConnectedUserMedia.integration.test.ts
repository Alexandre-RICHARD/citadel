import type { ConnectedUserMediaListDto } from "@citadel/specs/src/projects/backlog/dto/nas/connectedUserMediaListDto.type.ts";
import { LanguageTagEnum } from "@citadel/specs/src/projects/backlog/enum/languageTag.enum.ts";
import { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { buildSurveyedShow } from "../../../../testUtils/integration/backlog/nas/buildSurveyedShow.ts";
import { openNasOwnerSession } from "../../../../testUtils/integration/backlog/nas/openNasOwnerSession.ts";
import { openUnlockedNasAgent } from "../../../../testUtils/integration/backlog/nas/openUnlockedNasAgent.ts";
import { removeTestSurvey } from "../../../../testUtils/integration/backlog/nas/removeTestSurvey.ts";
import { writeTestSurvey } from "../../../../testUtils/integration/backlog/nas/writeTestSurvey.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { seedBacklogShow } from "../../../../testUtils/integration/backlog/seedBacklogShow.ts";
import { buildSurveyedMovie } from "../../../../testUtils/unit/backlog/buildSurveyedMovie.ts";

const USER_MEDIA_URL = `${ApiPrefixEnum.BACKLOG}/nas/user-media`;

async function addMovie(userId: number, runtimeMinutes: number | null = 100) {
	const movieId = await nextTmdbId();
	await insertMediaRows.movie({
		id: movieId,
		title: `Film ${movieId}`,
		runtimeMinutes,
	});
	await insertMediaRows.userMedia({ userId, movieId });
	return movieId;
}

describe("getConnectedUserMedia", () => {
	describe("200 OK", () => {
		it("SHOULD merge a movie with its survey line, by TMDB ID", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const movieId = await addMovie(owner.userId, 130);
			writeTestSurvey({ movies: [buildSurveyedMovie(movieId)] });

			// Act
			const response = await owner.agent.get(USER_MEDIA_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const { userMedia } = response.body as ConnectedUserMediaListDto;
			expect(userMedia.at(0)?.nas).toStrictEqual({
				storage: NasStorageEnum.IN_JELLYFIN,
				episodeCount: null,
				fileCount: 1,
				jellyfinItemId: `item-${movieId}`,
				jellyfinCollection: null,
				sharing: NasSharingEnum.NONE,
				torrents: [],
				quality: "fhd",
				languageTags: [
					{ tag: LanguageTagEnum.VF, count: 1 },
					{ tag: LanguageTagEnum.VO, count: 1 },
					{ tag: LanguageTagEnum.STFR, count: 1 },
				],
				sizeBytes: 4_000_000_000,
				gbPerHour: 2.4,
				fileMinutes: 100,
				isRuntimeMismatch: true,
				gaps: [],
				verifiedCount: 0,
				verifiableCount: 1,
			});
		});

		it("SHOULD say a movie is not tracked WHEN the survey does not know it", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			await addMovie(owner.userId);
			writeTestSurvey({});

			// Act
			const response = await owner.agent.get(USER_MEDIA_URL);

			// Assert
			const { userMedia } = response.body as ConnectedUserMediaListDto;
			expect(userMedia.at(0)?.nas).toMatchObject({
				storage: NasStorageEnum.NOT_TRACKED,
				fileCount: 0,
				verifiableCount: 0,
			});
		});

		it("SHOULD sum up a show on its aired main episodes", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const show = await seedBacklogShow({ episodeCounts: [1, 3] });
			await insertMediaRows.userMedia({
				userId: owner.userId,
				tvShowId: show.tvShowId,
			});
			writeTestSurvey({
				shows: [
					buildSurveyedShow(show.tvShowId, [
						[1, 1],
						[1, 2],
					]),
				],
			});

			// Act
			const response = await owner.agent.get(USER_MEDIA_URL);

			// Assert
			const { userMedia } = response.body as ConnectedUserMediaListDto;
			expect(userMedia.at(0)?.nas).toMatchObject({
				storage: NasStorageEnum.NOT_TRACKED,
				episodeCount: 3,
				fileCount: 2,
				jellyfinItemId: `show-${show.tvShowId}`,
				languageTags: [{ tag: LanguageTagEnum.VF, count: 2 }],
				sizeBytes: 2_000_000_000,
			});
		});

		it("SHOULD filter on a NAS column", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const onNas = await addMovie(owner.userId);
			await addMovie(owner.userId);
			writeTestSurvey({ movies: [buildSurveyedMovie(onNas)] });

			// Act
			const response = await owner.agent
				.get(USER_MEDIA_URL)
				.query({ storage: NasStorageEnum.IN_JELLYFIN });

			// Assert
			const { userMedia, matchedCount } =
				response.body as ConnectedUserMediaListDto;
			expect(matchedCount).toBe(1);
			expect(userMedia.map(({ tmdbId }) => tmdbId)).toStrictEqual([onNas]);
		});
	});

	describe("403 Forbidden", () => {
		it("SHOULD refuse WHEN the owner has not unlocked the connected mode", async () => {
			// Arrange
			const { cookie } = await openNasOwnerSession();

			// Act
			const response = await request(app)
				.get(USER_MEDIA_URL)
				.set("Cookie", cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect(response.body).toStrictEqual({
				code: BacklogErrorCodeEnum.NAS_LOCKED,
				message: "Connected mode is locked",
			});
		});
	});

	describe("503 Service Unavailable", () => {
		it("SHOULD refuse WHEN the job has never written its survey", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			removeTestSurvey();

			// Act
			const response = await owner.agent.get(USER_MEDIA_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE);
			expect(response.body).toMatchObject({
				code: BacklogErrorCodeEnum.NAS_SURVEY_UNAVAILABLE,
			});
		});
	});
});

import type { ForgottenMediaListDto } from "@citadel/specs/src/projects/backlog/dto/nas/forgottenMediaListDto.type.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { openUnlockedNasAgent } from "../../../../testUtils/integration/backlog/nas/openUnlockedNasAgent.ts";
import { writeTestSurvey } from "../../../../testUtils/integration/backlog/nas/writeTestSurvey.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { buildSurveyedMovie } from "../../../../testUtils/unit/backlog/buildSurveyedMovie.ts";

const FORGOTTEN_URL = `${ApiPrefixEnum.BACKLOG}/nas/forgotten-media`;

describe("getForgottenMedia", () => {
	describe("200 OK", () => {
		it("SHOULD list what the NAS holds without being in the backlog", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const inBacklog = await nextTmdbId();
			await insertMediaRows.movie({ id: inBacklog, title: "Dans le backlog" });
			await insertMediaRows.userMedia({
				userId: owner.userId,
				movieId: inBacklog,
			});
			const forgotten = await nextTmdbId();
			writeTestSurvey({
				movies: [buildSurveyedMovie(inBacklog), buildSurveyedMovie(forgotten)],
			});

			// Act
			const response = await owner.agent.get(FORGOTTEN_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(response.body as ForgottenMediaListDto).forgottenMedia,
			).toStrictEqual([
				{
					tmdbId: forgotten,
					mediaType: MediaTypeEnum.MOVIE,
					title: `Film ${forgotten}`,
					year: 1999,
					path: null,
					trackedBy: "radarr",
					fileCount: 1,
					sizeBytes: 4_000_000_000,
					isInJellyfin: true,
					torrentCount: 0,
				},
			]);
		});
	});

	describe("403 Forbidden", () => {
		it("SHOULD refuse WHEN the connected mode is locked", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();

			// Act
			const response = await request(app)
				.get(FORGOTTEN_URL)
				.set("Cookie", owner.sessionCookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
		});
	});
});

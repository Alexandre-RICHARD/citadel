import type { ShowSeasonListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/showSeasonListDto.type.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { seedBacklogShow } from "../../../../testUtils/integration/backlog/seedBacklogShow.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";

function seasonsUrl(userMediaId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-media/${userMediaId}/seasons`;
}

describe("getShowSeasons", () => {
	describe("200 OK", () => {
		it("SHOULD give the seasons by number with the specials last, and the episodes the account has watched", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const show = await seedBacklogShow({ episodeCounts: [1, 2, 1] });
			const userMediaId = await insertMediaRows.userMedia({
				userId: account.userId,
				tvShowId: show.tvShowId,
			});
			const [[specialId = 0] = [], [firstId = 0, secondId = 0] = []] =
				show.episodeIds;
			await insertMediaRows.watchedEpisode({
				userId: account.userId,
				tvEpisodeId: secondId,
			});

			// Act
			const response = await account.agent.get(seasonsUrl(userMediaId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const { seasons } = response.body as ShowSeasonListDto;
			expect(seasons.map(({ seasonNumber }) => seasonNumber)).toStrictEqual([
				1, 2, 0,
			]);
			expect(seasons.at(0)?.episodes).toStrictEqual([
				{
					id: firstId,
					episodeNumber: 1,
					name: "Épisode 1",
					airDate: "2020-01-01",
					runtimeMinutes: 50,
					stillPath: null,
					isWatched: false,
				},
				expect.objectContaining({ id: secondId, isWatched: true }) as unknown,
			]);
			expect(seasons.at(2)?.episodes.map(({ id }) => id)).toStrictEqual([
				specialId,
			]);
		});

		it("SHOULD give no season WHEN the media is a movie", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const movieId = await nextTmdbId();
			await insertMediaRows.movie({ id: movieId, title: "Alien" });
			const userMediaId = await insertMediaRows.userMedia({
				userId: account.userId,
				movieId,
			});

			// Act
			const response = await account.agent.get(seasonsUrl(userMediaId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({ seasons: [] });
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer as absent the show of another account", async () => {
			// Arrange
			const owner = await openSignedInAgent();
			const stranger = await openSignedInAgent();
			const show = await seedBacklogShow({ episodeCounts: [0, 1] });
			const userMediaId = await insertMediaRows.userMedia({
				userId: owner.userId,
				tvShowId: show.tvShowId,
			});

			// Act
			const response = await stranger.agent.get(seasonsUrl(userMediaId));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND,
				`No backlog media with id : ${userMediaId}`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(seasonsUrl(1));

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

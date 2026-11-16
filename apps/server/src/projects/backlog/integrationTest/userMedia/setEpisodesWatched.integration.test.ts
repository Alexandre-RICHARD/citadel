import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { seedBacklogShow } from "../../../../testUtils/integration/backlog/seedBacklogShow.ts";
import { selectMediaRows } from "../../../../testUtils/integration/backlog/selectMediaRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";

function watchedUrl(userMediaId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-media/${userMediaId}/watched-episodes`;
}

// Un compte connecté avec une série de deux saisons (3 et 2 épisodes, plus une saison de spéciaux à 1 épisode)
async function openAccountWithShow() {
	const account = await openSignedInAgent();
	const show = await seedBacklogShow({ episodeCounts: [1, 3, 2] });
	const userMediaId = await insertMediaRows.userMedia({
		userId: account.userId,
		tvShowId: show.tvShowId,
	});
	return { account, show, userMediaId };
}

describe("setEpisodesWatched", () => {
	describe("200 OK", () => {
		it("SHOULD tick the episodes sent and count the progress on the main seasons", async () => {
			// Arrange
			const { account, show, userMediaId } = await openAccountWithShow();
			const [specials = [], firstSeason = []] = show.episodeIds;

			// Act
			const response = await account.agent.put(watchedUrl(userMediaId)).send({
				episodeIds: [...firstSeason, ...specials],
				isWatched: true,
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({
				isWatched: false,
				watchedEpisodeCount: 3,
				airedEpisodeCount: 5,
			});
		});

		it("SHOULD mark the show as watched WHEN every main episode is, and untick the ones sent back", async () => {
			// Arrange
			const { account, show, userMediaId } = await openAccountWithShow();
			const [, firstSeason = [], secondSeason = []] = show.episodeIds;
			const everyMainEpisode = [...firstSeason, ...secondSeason];

			// Act
			const watched = await account.agent.put(watchedUrl(userMediaId)).send({
				episodeIds: everyMainEpisode,
				isWatched: true,
			});
			const unwatched = await account.agent.put(watchedUrl(userMediaId)).send({
				episodeIds: secondSeason,
				isWatched: false,
			});

			// Assert
			expect(watched.body).toMatchObject({
				isWatched: true,
				watchedEpisodeCount: 5,
			});
			expect(unwatched.body).toMatchObject({
				isWatched: false,
				watchedEpisodeCount: 3,
			});
			expect(
				await selectMediaRows.watchedEpisodeIds(account.userId),
			).toStrictEqual(firstSeason);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD refuse an episode of another show, and tick nothing", async () => {
			// Arrange
			const { account, show, userMediaId } = await openAccountWithShow();
			const other = await seedBacklogShow({ episodeCounts: [0, 1] });
			const [, [foreignId = 0] = []] = other.episodeIds;
			const [, [ownId = 0] = []] = show.episodeIds;

			// Act
			const response = await account.agent.put(watchedUrl(userMediaId)).send({
				episodeIds: [ownId, foreignId],
				isWatched: true,
			});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.EPISODE_NOT_IN_SHOW,
				`Episode ${foreignId} is not an episode of backlog media ${userMediaId}`,
			);
			expect(
				await selectMediaRows.watchedEpisodeIds(account.userId),
			).toStrictEqual([]);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app)
				.put(watchedUrl(1))
				.send({ episodeIds: [1], isWatched: true });

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

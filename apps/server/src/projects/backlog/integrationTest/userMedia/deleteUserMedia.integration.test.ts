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

function deleteUrl(userMediaId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-media/${userMediaId}`;
}

describe("deleteUserMedia", () => {
	describe("204 No Content", () => {
		it("SHOULD remove the show, its watched episodes and its saga, and keep the show in the database", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const show = await seedBacklogShow({ episodeCounts: [0, 2] });
			const sagaId = await insertMediaRows.saga({
				userId: account.userId,
				name: "Star Wars",
			});
			const userMediaId = await insertMediaRows.userMedia({
				userId: account.userId,
				tvShowId: show.tvShowId,
				sagaId,
				sagaNumber: 1,
			});
			const [, [episodeId = 0] = []] = show.episodeIds;
			await insertMediaRows.watchedEpisode({
				userId: account.userId,
				tvEpisodeId: episodeId,
			});

			// Act
			const response = await account.agent.delete(deleteUrl(userMediaId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(await selectMediaRows.userMediaIds(account.userId)).toStrictEqual(
				[],
			);
			expect(
				await selectMediaRows.watchedEpisodeIds(account.userId),
			).toStrictEqual([]);
			expect(await selectMediaRows.sagaNames(account.userId)).toStrictEqual([]);
			expect(
				await selectMediaRows.episodeIdsOfShow(show.tvShowId),
			).toHaveLength(2);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer as absent the media of another account, and remove nothing", async () => {
			// Arrange
			const owner = await openSignedInAgent();
			const stranger = await openSignedInAgent();
			const show = await seedBacklogShow({ episodeCounts: [0, 1] });
			const userMediaId = await insertMediaRows.userMedia({
				userId: owner.userId,
				tvShowId: show.tvShowId,
			});

			// Act
			const response = await stranger.agent.delete(deleteUrl(userMediaId));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND,
				`No backlog media with id : ${userMediaId}`,
			);
			expect(await selectMediaRows.userMediaIds(owner.userId)).toStrictEqual([
				userMediaId,
			]);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).delete(deleteUrl(1));

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

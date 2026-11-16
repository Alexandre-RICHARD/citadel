import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { seedBacklogShow } from "../../../../testUtils/integration/backlog/seedBacklogShow.ts";
import { selectMediaRows } from "../../../../testUtils/integration/backlog/selectMediaRows.ts";
import { tmdbGateway } from "../../tmdb/tmdbGateway.ts";
import type { TmdbShowData } from "../../tmdb/type/tmdbShowData.type.ts";

const REFRESH_URL = `${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.BACKLOG}/show-updates`;

function episode(id: number, episodeNumber: number) {
	return {
		id,
		episodeNumber,
		name: `Épisode ${episodeNumber}`,
		airDate: "2020-01-01",
		runtimeMinutes: 50,
		stillPath: null,
	};
}

describe("refreshOngoingShows", () => {
	describe("200 OK", () => {
		it("SHOULD read again the ongoing shows of every backlog and store their new episodes", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const show = await seedBacklogShow({
				episodeCounts: [0, 1],
				isOngoing: true,
			});
			await insertMediaRows.userMedia({
				userId: account.userId,
				tvShowId: show.tvShowId,
			});
			const [, [episodeId = 0] = []] = show.episodeIds;
			const [, seasonId = 0] = show.seasonIds;
			const newEpisodeId = await nextTmdbId();
			// Les autres séries en cours de la base de test n'ont rien de nouveau : TMDB ne les connaît plus
			vi.spyOn(tmdbGateway, "fetchFreshShow").mockImplementation((tmdbId) =>
				Promise.resolve(
					tmdbId === show.tvShowId
						? ({
								id: show.tvShowId,
								name: "Dark",
								originalName: "Dark",
								originalLanguage: "de",
								firstAirDate: "2017-12-01",
								imdbId: null,
								posterPath: null,
								isOngoing: false,
								seasons: [
									{
										id: seasonId,
										seasonNumber: 1,
										name: "Saison 1",
										airDate: null,
										posterPath: null,
										episodes: [episode(episodeId, 1), episode(newEpisodeId, 2)],
									},
								],
							} satisfies TmdbShowData)
						: null,
				),
			);

			// Act
			const response = await request(app).post(REFRESH_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({ updatedCount: 1 });
			expect(
				await selectMediaRows.episodeIdsOfShow(show.tvShowId),
			).toStrictEqual([episodeId, newEpisodeId]);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer as an unknown route WHEN the call comes through Caddy", async () => {
			// Act
			const response = await request(app)
				.post(REFRESH_URL)
				.set("X-Real-IP", "203.0.113.7");

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.NOT_FOUND);
			expect(response.body).toMatchObject({
				code: TechnicalErrorCodeEnum.ROUTE_NOT_FOUND,
			});
		});
	});
});

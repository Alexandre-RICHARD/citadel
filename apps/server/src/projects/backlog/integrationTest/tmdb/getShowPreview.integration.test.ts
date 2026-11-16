import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { buildTmdbShowData } from "../../../../testUtils/integration/backlog/buildTmdbShowData.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { tmdbGateway } from "../../tmdb/tmdbGateway.ts";

function previewUrl(tmdbId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/tmdb/shows/${tmdbId}`;
}

describe("getShowPreview", () => {
	describe("200 OK", () => {
		it("SHOULD describe the show with all its seasons and episodes, specials included", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const show = await buildTmdbShowData({
				isOngoing: true,
				withSpecials: true,
				seasons: [
					{ airDates: ["2018-01-01"] },
					{ airDates: ["2017-12-01", null] },
				],
			});
			vi.spyOn(tmdbGateway, "fetchShow").mockResolvedValueOnce(show);

			// Act
			const response = await account.agent.get(previewUrl(show.id));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				tmdbId: show.id,
				title: "Dark",
				originalTitle: "Dark",
				originalLanguage: "de",
				firstAirDate: "2017-12-01",
				posterPath: "/dark.jpg",
				isOngoing: true,
				seasons: [
					{
						seasonNumber: 0,
						name: "Épisodes spéciaux",
						airDate: "2018-01-01",
						episodes: [
							{ episodeNumber: 1, name: "Épisode 1", airDate: "2018-01-01" },
						],
					},
					{
						seasonNumber: 1,
						name: "Saison 1",
						airDate: "2017-12-01",
						episodes: [
							{ episodeNumber: 1, name: "Épisode 1", airDate: "2017-12-01" },
							{ episodeNumber: 2, name: "Épisode 2", airDate: null },
						],
					},
				],
				userMediaId: null,
			});
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that TMDB does not know the show", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const tmdbId = await nextTmdbId();
			vi.spyOn(tmdbGateway, "fetchShow").mockResolvedValueOnce(null);

			// Act
			const response = await account.agent.get(previewUrl(tmdbId));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.TMDB_MEDIA_NOT_FOUND,
				`No show on TMDB with id : ${tmdbId}`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(previewUrl(1396));

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

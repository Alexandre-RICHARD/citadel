import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { tmdbGateway } from "../../tmdb/tmdbGateway.ts";

function postersUrl(mediaType: string, tmdbId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/tmdb/${mediaType}/${tmdbId}/posters`;
}

describe("getMediaPosters", () => {
	describe("200 OK", () => {
		it("SHOULD give the posters of the show, as TMDB orders them", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const fetchPosterPaths = vi
				.spyOn(tmdbGateway, "fetchPosterPaths")
				.mockResolvedValueOnce(["/a.jpg", "/b.jpg"]);

			// Act
			const response = await account.agent.get(
				postersUrl(MediaTypeEnum.SHOW, 1396),
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				posterPaths: ["/a.jpg", "/b.jpg"],
			});
			expect(fetchPosterPaths).toHaveBeenCalledWith(MediaTypeEnum.SHOW, 1396);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse an unknown media type", async () => {
			// Arrange
			const account = await openSignedInAgent();

			// Act
			const response = await account.agent.get(postersUrl("games", 1));

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that TMDB does not know the media", async () => {
			// Arrange
			const account = await openSignedInAgent();
			vi.spyOn(tmdbGateway, "fetchPosterPaths").mockResolvedValueOnce(null);

			// Act
			const response = await account.agent.get(
				postersUrl(MediaTypeEnum.MOVIE, 7),
			);

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.TMDB_MEDIA_NOT_FOUND,
				"No movie on TMDB with id : 7",
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(
				postersUrl(MediaTypeEnum.MOVIE, 7),
			);

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

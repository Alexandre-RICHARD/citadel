import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { igdbGateway } from "../../igdb/igdbGateway.ts";

function imagesUrl(igdbId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/igdb/games/${igdbId}/images`;
}

describe("getGameImages", () => {
	describe("200 OK", () => {
		it("SHOULD give the cover first, then the artworks", async () => {
			// Arrange
			const igdbId = await nextIgdbId();
			vi.spyOn(igdbGateway, "fetchGameImages").mockResolvedValueOnce({
				id: igdbId,
				cover: { image_id: "co1" },
				artworks: [{ image_id: "ar1" }, { image_id: "ar2" }],
			});

			// Act
			const response = await request(app).get(imagesUrl(igdbId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({ imageIds: ["co1", "ar1", "ar2"] });
		});

		it("SHOULD give an empty list WHEN the game has no image", async () => {
			// Arrange
			const igdbId = await nextIgdbId();
			vi.spyOn(igdbGateway, "fetchGameImages").mockResolvedValueOnce({
				id: igdbId,
			});

			// Act
			const response = await request(app).get(imagesUrl(igdbId));

			// Assert
			expect(response.body).toStrictEqual({ imageIds: [] });
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the IGDB game does not exist", async () => {
			// Arrange
			const igdbId = await nextIgdbId();
			vi.spyOn(igdbGateway, "fetchGameImages").mockResolvedValueOnce(null);

			// Act
			const response = await request(app).get(imagesUrl(igdbId));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.IGDB_GAME_NOT_FOUND,
				`No IGDB game with id : ${igdbId}`,
			);
		});
	});
});

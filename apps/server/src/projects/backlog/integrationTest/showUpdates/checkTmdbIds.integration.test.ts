import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { getGoneTmdbIdsQuery } from "../../query/tmdbCheck/getGoneTmdbIdsQuery.ts";
import { tmdbGateway } from "../../tmdb/tmdbGateway.ts";

const CHECK_URL = `${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.BACKLOG}/tmdb-ids/check`;

/**
 * Huit passages de nuit : la base de test garde les médias des autres tests, et chaque nuit n'en relit qu'un septième.
 * Huit tranches passent par chaque média, même par celui relu à la première
 */
async function checkEveryNightOfAWeek() {
	let response = await request(app).post(CHECK_URL);
	for (let night = 1; night < 8; night += 1)
		// eslint-disable-next-line no-await-in-loop -- les tranches se suivent, comme les nuits
		response = await request(app).post(CHECK_URL);
	return response;
}

describe("checkTmdbIds", () => {
	describe("200 OK", () => {
		it("SHOULD mark a media that TMDB no longer knows, and clear it WHEN it comes back", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const gone = await nextTmdbId();
			await insertMediaRows.movie({ id: gone, title: "Disparu" });
			await insertMediaRows.userMedia({
				userId: account.userId,
				movieId: gone,
			});
			const isKnown = vi
				.spyOn(tmdbGateway, "isKnown")
				.mockImplementation((_mediaType, tmdbId) =>
					Promise.resolve(tmdbId !== gone),
				);

			// Act
			const response = await checkEveryNightOfAWeek();

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(isKnown).toHaveBeenCalledWith(MediaTypeEnum.MOVIE, gone);
			expect(await getGoneTmdbIdsQuery(account.userId)).toStrictEqual(
				new Set([`${MediaTypeEnum.MOVIE}:${gone}`]),
			);

			// Act : TMDB le connaît de nouveau
			isKnown.mockResolvedValue(true);
			await checkEveryNightOfAWeek();

			// Assert
			expect(await getGoneTmdbIdsQuery(account.userId)).toStrictEqual(
				new Set(),
			);
		});
	});
});

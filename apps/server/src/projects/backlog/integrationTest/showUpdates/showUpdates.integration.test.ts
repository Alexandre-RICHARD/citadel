import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { runInTransaction } from "../../../../common/database/runInTransaction.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { buildTmdbShowData } from "../../../../testUtils/integration/backlog/buildTmdbShowData.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { selectMediaRows } from "../../../../testUtils/integration/backlog/selectMediaRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { upsertShowQuery } from "../../query/tvShow/upsertShowQuery.ts";
import { tmdbGateway } from "../../tmdb/tmdbGateway.ts";
import type { TmdbShowData } from "../../tmdb/type/tmdbShowData.type.ts";

const UPDATES_URL = `${ApiPrefixEnum.BACKLOG}/show-updates`;

// Une série en cours, en base avec une saison d'un épisode, et la même fiche sur TMDB avec un épisode de plus
async function seedOngoingShowWithNews(): Promise<{
	stored: TmdbShowData;
	fresh: TmdbShowData;
}> {
	const stored = await buildTmdbShowData({
		isOngoing: true,
		seasons: [{ airDates: ["2017-12-01"] }],
	});
	await runInTransaction("seed show", (transaction) =>
		upsertShowQuery(stored, transaction),
	);
	const [season] = stored.seasons;
	if (season === undefined) throw new Error("The seeded show has no season");
	const fresh: TmdbShowData = {
		...stored,
		seasons: [
			{
				...season,
				episodes: [
					...season.episodes,
					{
						id: await nextTmdbId(),
						episodeNumber: 2,
						name: "Épisode 2",
						airDate: "2017-12-08",
						runtimeMinutes: 50,
						stillPath: null,
					},
				],
			},
		],
	};
	return { stored, fresh };
}

describe("showUpdates", () => {
	describe("200 OK", () => {
		it("SHOULD list the new episodes without storing them, then store them on validation", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const { stored, fresh } = await seedOngoingShowWithNews();
			await insertMediaRows.userMedia({
				userId: account.userId,
				tvShowId: stored.id,
			});
			const fetchFreshShow = vi
				.spyOn(tmdbGateway, "fetchFreshShow")
				.mockResolvedValueOnce(fresh);

			// Act
			const summary = await account.agent.get(UPDATES_URL);
			const episodesBeforeValidation = await selectMediaRows.episodeIdsOfShow(
				stored.id,
			);
			const applied = await account.agent
				.post(UPDATES_URL)
				.send({ tmdbIds: [stored.id] });

			// Assert
			expect(summary.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(summary.body).toStrictEqual([
				{
					tmdbId: stored.id,
					title: "Dark",
					newSeasonCount: 0,
					newEpisodeCount: 1,
				},
			]);
			expect(episodesBeforeValidation).toHaveLength(1);
			expect(applied.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(applied.body).toStrictEqual({ updatedCount: 1 });
			expect(await selectMediaRows.episodeIdsOfShow(stored.id)).toHaveLength(2);
			// La validation reprend la fiche du récapitulatif, sans relire TMDB
			expect(fetchFreshShow).toHaveBeenCalledTimes(1);
		});
	});

	describe("204 No Content", () => {
		it("SHOULD answer with no content WHEN no ongoing show of the backlog has news", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const { stored } = await seedOngoingShowWithNews();
			await insertMediaRows.userMedia({
				userId: account.userId,
				tvShowId: stored.id,
			});
			vi.spyOn(tmdbGateway, "fetchFreshShow").mockResolvedValueOnce(stored);

			// Act
			const response = await account.agent.get(UPDATES_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD refuse a show that is not in the backlog of the account", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const { stored } = await seedOngoingShowWithNews();

			// Act
			const response = await account.agent
				.post(UPDATES_URL)
				.send({ tmdbIds: [stored.id] });

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND,
				`No show in the backlog with TMDB id : ${stored.id}`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(UPDATES_URL);

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

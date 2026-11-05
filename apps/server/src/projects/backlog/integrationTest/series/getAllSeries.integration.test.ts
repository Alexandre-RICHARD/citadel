import type { SeriesListDto } from "@citadel/specs/src/projects/backlog/dto/series/seriesListDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { nextIgdbId } from "../../../../testUtils/integration/backlog/nextIgdbId.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

const SERIES_URL = `${ApiPrefixEnum.BACKLOG}/series`;

describe("getAllSeries", () => {
	describe("200 OK", () => {
		it("SHOULD give the IGDB series and the series of the account, never those of another account", async () => {
			// Arrange
			const word = buildUniqueWord();
			const igdbId = await insertBacklogRows.series({
				name: `${word} IGDB`,
				igdbCollectionId: await nextIgdbId(),
			});
			const mineId = await insertBacklogRows.series({
				userId: player.userId,
				name: `${word} mine`,
			});
			const other = await openSignedInAgent();
			const othersId = await insertBacklogRows.series({
				userId: other.userId,
				name: `${word} others`,
			});

			// Act
			const response = await player.agent.get(SERIES_URL);

			// Assert
			const ids = (response.body as { series: { id: number }[] }).series.map(
				({ id }) => id,
			);
			expect(ids).toContain(igdbId);
			expect(ids).toContain(mineId);
			expect(ids).not.toContain(othersId);
		});

		it("SHOULD give every series sorted by name", async () => {
			// Arrange
			const word = `Zq${Math.random().toString(36).slice(2, 8)}`;
			const secondId = await insertBacklogRows.series({
				userId: player.userId,
				name: `${word} B`,
			});
			const firstId = await insertBacklogRows.series({
				userId: player.userId,
				name: `${word} A`,
			});

			// Act
			const response = await player.agent.get(SERIES_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(response.body as SeriesListDto).series.filter(({ name }) =>
					name.startsWith(word),
				),
			).toStrictEqual([
				{ id: firstId, name: `${word} A` },
				{ id: secondId, name: `${word} B` },
			]);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(SERIES_URL);

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

import type { BacklogOverviewDto } from "@citadel/specs/src/projects/backlog/dto/overview/backlogOverviewDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { SEEDED_PLATFORMS } from "../../../../testUtils/integration/backlog/seededPlatforms.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";

// Le compte de ce fichier : son backlog, et la session de chaque requête
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

const OVERVIEW_URL = `${ApiPrefixEnum.BACKLOG}/overview`;

async function getOverview(): Promise<BacklogOverviewDto> {
	return (await player.agent.get(OVERVIEW_URL)).body as BacklogOverviewDto;
}

describe("getBacklogOverview", () => {
	describe("200 OK", () => {
		it("SHOULD count only the backlog of the account", async () => {
			// Arrange
			const newcomer = await openSignedInAgent();
			const before = (await newcomer.agent.get(OVERVIEW_URL))
				.body as BacklogOverviewDto;
			const backlogGame = await seedBacklogGame({
				userId: player.userId,
				platformIds: [SEEDED_PLATFORMS.PS2],
			});

			// Act
			const response = await newcomer.agent.get(OVERVIEW_URL);

			// Assert : le jeu du backlog d'un autre compte est, pour celui-ci, un jeu de « Ma base »
			const overview = response.body as BacklogOverviewDto;
			expect(overview).toMatchObject({
				gameCount: 0,
				userVersionCount: 0,
				outsideBacklogGameCount: before.outsideBacklogGameCount + 1,
				playedPlatforms: [],
			});
			expect(backlogGame.userVersionIds).toHaveLength(1);
		});

		it("SHOULD count the backlog games, the played versions and the games outside the backlog", async () => {
			// Arrange
			const before = await getOverview();

			// Act
			await seedBacklogGame({ userId: player.userId });
			await seedStoredGame();
			const response = await player.agent.get(OVERVIEW_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({
				gameCount: before.gameCount + 1,
				userVersionCount: before.userVersionCount + 1,
				outsideBacklogGameCount: before.outsideBacklogGameCount + 1,
			});
		});

		it("SHOULD give the platforms of the played versions, with emulators", async () => {
			// Arrange
			await seedBacklogGame({
				userId: player.userId,
				platformIds: [SEEDED_PLATFORMS.PS2],
			});

			// Act
			const overview = await getOverview();

			// Assert
			expect(overview.playedPlatforms).toContainEqual({
				id: SEEDED_PLATFORMS.PS2,
				shortName: "PS2",
				technicalName: "ps2",
				emulatedPlatformId: null,
			});
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(OVERVIEW_URL);

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});

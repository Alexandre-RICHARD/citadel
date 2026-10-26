import type { BacklogOverviewDto } from "@citadel/specs/src/projects/backlog/dto/overview/backlogOverviewDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { SEEDED_PLATFORMS } from "../../../../testUtils/integration/backlog/seededPlatforms.ts";
import { seedStoredGame } from "../../../../testUtils/integration/backlog/seedStoredGame.ts";

const OVERVIEW_URL = `${ApiPrefixEnum.BACKLOG}/overview`;

async function getOverview(): Promise<BacklogOverviewDto> {
	return (await request(app).get(OVERVIEW_URL)).body as BacklogOverviewDto;
}

describe("getBacklogOverview", () => {
	describe("200 OK", () => {
		it("SHOULD count the backlog games, the played versions and the games outside the backlog", async () => {
			// Arrange
			const before = await getOverview();

			// Act
			await seedBacklogGame();
			await seedStoredGame();
			const response = await request(app).get(OVERVIEW_URL);

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
			await seedBacklogGame({ platformIds: [SEEDED_PLATFORMS.PS2] });

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
});

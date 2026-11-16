import type { ConnectedShowSeasonListDto } from "@citadel/specs/src/projects/backlog/dto/nas/connectedShowSeasonListDto.type.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import { describe, expect, it } from "vitest";

import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { buildSurveyedShow } from "../../../../testUtils/integration/backlog/nas/buildSurveyedShow.ts";
import { openUnlockedNasAgent } from "../../../../testUtils/integration/backlog/nas/openUnlockedNasAgent.ts";
import { writeTestSurvey } from "../../../../testUtils/integration/backlog/nas/writeTestSurvey.ts";
import { seedBacklogShow } from "../../../../testUtils/integration/backlog/seedBacklogShow.ts";

function seasonsUrl(userMediaId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/nas/user-media/${userMediaId}/seasons`;
}

describe("getConnectedShowSeasons", () => {
	describe("200 OK", () => {
		it("SHOULD give each season and episode its NAS columns, and none to the specials", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();
			const show = await seedBacklogShow({ episodeCounts: [1, 2] });
			const userMediaId = await insertMediaRows.userMedia({
				userId: owner.userId,
				tvShowId: show.tvShowId,
			});
			writeTestSurvey({ shows: [buildSurveyedShow(show.tvShowId, [[1, 2]])] });

			// Act
			const response = await owner.agent.get(seasonsUrl(userMediaId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const [firstSeason, specials] = (
				response.body as ConnectedShowSeasonListDto
			).seasons;
			expect(firstSeason?.nas).toMatchObject({
				storage: NasStorageEnum.NOT_TRACKED,
				episodeCount: 2,
				fileCount: 1,
				jellyfinItemId: null,
			});
			expect(
				firstSeason?.episodes.map(({ nas }) => nas?.storage),
			).toStrictEqual([NasStorageEnum.NOT_TRACKED, NasStorageEnum.IN_JELLYFIN]);
			expect(specials?.nas).toBeNull();
			expect(specials?.episodes.at(0)?.nas).toBeNull();
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse WHEN the id is not a number", async () => {
			// Arrange
			const owner = await openUnlockedNasAgent();

			// Act
			const response = await owner.agent.get(
				`${ApiPrefixEnum.BACKLOG}/nas/user-media/abc/seasons`,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
		});
	});
});

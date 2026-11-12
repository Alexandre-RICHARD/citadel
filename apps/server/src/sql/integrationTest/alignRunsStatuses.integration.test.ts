import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { QueryTypes } from "sequelize";
import { describe, expect, it } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { openSignedInAgent } from "../../testUtils/integration/auth/openSignedInAgent.ts";
import { seedBacklogGame } from "../../testUtils/integration/backlog/seedBacklogGame.ts";
import { selectBacklogRows } from "../../testUtils/integration/backlog/selectBacklogRows.ts";
import { replayMigration } from "../../testUtils/integration/replayMigration.ts";

// La migration V026
const MIGRATION_FILE = "V026__align_runs_statuses.sql";

async function selectStatuses(
	userId: number,
	gameId: number,
): Promise<string[]> {
	const userVersions = await selectBacklogRows.userVersions(userId, gameId);
	return userVersions.map(({ status }) => status);
}

describe("alignRunsStatuses", () => {
	describe("games in runs", () => {
		it("SHOULD turn Finished into Deemed finished and Watched into Not started, and leave the other statuses", async () => {
			// Arrange
			const { userId } = await openSignedInAgent();
			const runs = await seedBacklogGame({
				userId,
				endingType: EndingTypeEnum.RUNS,
				userVersionStatuses: [
					StatusEnum.FINISHED,
					StatusEnum.WATCHED,
					StatusEnum.STARTED,
					StatusEnum.PLATINUM,
				],
			});

			// Act
			await replayMigration(MIGRATION_FILE);

			// Assert
			expect(await selectStatuses(userId, runs.gameId)).toStrictEqual([
				StatusEnum.DEEMED_FINISHED,
				StatusEnum.NOT_STARTED,
				StatusEnum.STARTED,
				StatusEnum.PLATINUM,
			]);
		});

		it("SHOULD keep the date of the last change of a played version", async () => {
			// Arrange
			const { userId } = await openSignedInAgent();
			const runs = await seedBacklogGame({
				userId,
				endingType: EndingTypeEnum.RUNS,
				userVersionStatuses: [StatusEnum.FINISHED],
				createdAt: new Date("2026-01-01T00:00:00Z"),
			});

			// Act
			await replayMigration(MIGRATION_FILE);

			// Assert
			const row = await sequelize.query<{ updatedAt: Date }>(
				"SELECT updated_at AS updatedAt FROM backlog_user_version WHERE id = :id",
				{
					type: QueryTypes.SELECT,
					plain: true,
					replacements: { id: runs.userVersionIds[0] },
				},
			);
			expect(row?.updatedAt.toISOString()).toBe("2026-01-01T00:00:00.000Z");
		});
	});

	describe("other games", () => {
		it("SHOULD leave the statuses of a story game", async () => {
			// Arrange
			const { userId } = await openSignedInAgent();
			const story = await seedBacklogGame({
				userId,
				endingType: EndingTypeEnum.STORY,
				userVersionStatuses: [StatusEnum.FINISHED, StatusEnum.WATCHED],
			});

			// Act
			await replayMigration(MIGRATION_FILE);

			// Assert
			expect(await selectStatuses(userId, story.gameId)).toStrictEqual([
				StatusEnum.FINISHED,
				StatusEnum.WATCHED,
			]);
		});
	});
});

import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { QueryTypes } from "sequelize";
import { describe, expect, it, onTestFinished } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { openSignedInAgent } from "../../testUtils/integration/auth/openSignedInAgent.ts";
import { seedBacklogGame } from "../../testUtils/integration/backlog/seedBacklogGame.ts";
import { selectBacklogRows } from "../../testUtils/integration/backlog/selectBacklogRows.ts";
import { replayMigration } from "../../testUtils/integration/replayMigration.ts";
import { selectEnumColumnValues } from "../../testUtils/integration/selectEnumColumnValues.ts";

// La migration V028
const MIGRATION_FILE = "V028__merge_deemed_finished_status.sql";

// La colonne telle que V009 l'a laissée, avec « Estimé fini »
async function restoreColumnBeforeMigration(): Promise<void> {
	await sequelize.query(
		`ALTER TABLE backlog_user_version MODIFY COLUMN status ENUM (
			'notStarted', 'watched', 'started', 'wellUnderway', 'finished', 'deemedFinished',
			'completed', 'platinum', 'completedAndPlatinum', 'abandoned'
		) NOT NULL DEFAULT 'notStarted'`,
	);
}

// Après le test, quoi qu'il arrive : la colonne retrouve l'état de V028, sans quoi tous les tests du Backlog
// échoueraient et masqueraient la vraie panne. Sans effet si la migration rejouée a réussi
async function restoreColumnAfterMigration(): Promise<void> {
	await sequelize.query(
		"UPDATE backlog_user_version SET status = 'finished', updated_at = updated_at WHERE status = 'deemedFinished'",
	);
	await replayMigration(MIGRATION_FILE);
}

describe("mergeDeemedFinishedStatus", () => {
	describe("existing rows", () => {
		it("SHOULD turn Deemed finished into Finished, keep the date of the last change, and leave the other statuses", async () => {
			// Arrange
			const { userId } = await openSignedInAgent();
			const game = await seedBacklogGame({
				userId,
				endingType: EndingTypeEnum.RUNS,
				userVersionStatuses: [
					StatusEnum.FINISHED,
					StatusEnum.STARTED,
					StatusEnum.PLATINUM,
				],
				createdAt: new Date("2026-01-01T00:00:00Z"),
			});
			await restoreColumnBeforeMigration();
			onTestFinished(restoreColumnAfterMigration);
			await sequelize.query(
				`UPDATE backlog_user_version SET status = 'deemedFinished', updated_at = updated_at
				WHERE id = :id`,
				{ replacements: { id: game.userVersionIds[0] } },
			);

			// Act
			await replayMigration(MIGRATION_FILE);

			// Assert
			const userVersions = await selectBacklogRows.userVersions(
				userId,
				game.gameId,
			);
			expect(userVersions.map(({ status }) => status)).toStrictEqual([
				StatusEnum.FINISHED,
				StatusEnum.STARTED,
				StatusEnum.PLATINUM,
			]);
			const row = await sequelize.query<{ updatedAt: Date }>(
				"SELECT updated_at AS updatedAt FROM backlog_user_version WHERE id = :id",
				{
					type: QueryTypes.SELECT,
					plain: true,
					replacements: { id: game.userVersionIds[0] },
				},
			);
			expect(row?.updatedAt.toISOString()).toBe("2026-01-01T00:00:00.000Z");
		});

		it("SHOULD leave the column with the statuses in the order of the scale", async () => {
			// Assert
			expect(
				await selectEnumColumnValues("backlog_user_version", "status"),
			).toStrictEqual(Object.values(StatusEnum));
		});
	});
});

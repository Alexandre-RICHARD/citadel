import { DatabaseError, QueryTypes, UniqueConstraintError } from "sequelize";
import { describe, expect, it, onTestFinished } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { insertAuthRows } from "../../testUtils/integration/auth/insertAuthRows.ts";
import { insertBacklogRows } from "../../testUtils/integration/backlog/insertBacklogRows.ts";
import { nextIgdbId } from "../../testUtils/integration/backlog/nextIgdbId.ts";
import { SEEDED_PLATFORMS } from "../../testUtils/integration/backlog/seededPlatforms.ts";
import { seedStoredGame } from "../../testUtils/integration/backlog/seedStoredGame.ts";
import { selectBacklogRows } from "../../testUtils/integration/backlog/selectBacklogRows.ts";
import { countTableRows } from "../../testUtils/integration/countTableRows.ts";
import { replayMigration } from "../../testUtils/integration/replayMigration.ts";

// La migration V022
const MIGRATION_FILE = "V022__add_backlog_user_id.sql";

const OWNED_TABLES = [
	"backlog_user_game",
	"backlog_user_version",
	"backlog_series",
] as const;

type ColumnRow = { tableName: string };

// Les tables qui ont déjà leur colonne user_id
async function selectTablesWithUserId(): Promise<string[]> {
	const rows = await sequelize.query<ColumnRow>(
		`SELECT TABLE_NAME AS tableName FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'user_id' AND TABLE_NAME IN (:tables)
		ORDER BY TABLE_NAME`,
		{ type: QueryTypes.SELECT, replacements: { tables: [...OWNED_TABLES] } },
	);
	return rows.map((row) => row.tableName);
}

// Les tables telles que V021 les a laissées : un seul backlog, sans propriétaire. Les lignes des autres tests partent
// d'abord : deux comptes peuvent avoir le même jeu, que l'ancienne clé primaire refuserait
async function restoreTablesBeforeMigration(): Promise<void> {
	const statements = [
		"DELETE FROM backlog_user_version",
		"DELETE FROM backlog_user_game",
		"DELETE FROM backlog_series WHERE user_id IS NOT NULL",
		"ALTER TABLE backlog_series DROP CONSTRAINT ck_backlog_series_owner",
		"ALTER TABLE backlog_series DROP FOREIGN KEY fk_backlog_series_user",
		"ALTER TABLE backlog_series DROP COLUMN user_id",
		"ALTER TABLE backlog_user_version DROP FOREIGN KEY fk_backlog_user_version_user",
		`ALTER TABLE backlog_user_version
			DROP INDEX uq_backlog_user_version_user_version_platform,
			ADD CONSTRAINT uq_backlog_user_version_version_platform UNIQUE (version_id, platform_id)`,
		"DROP INDEX idx_backlog_user_version_version_id ON backlog_user_version",
		"ALTER TABLE backlog_user_version DROP COLUMN user_id",
		"ALTER TABLE backlog_user_game DROP FOREIGN KEY fk_backlog_user_game_user",
		"ALTER TABLE backlog_user_game DROP PRIMARY KEY, ADD PRIMARY KEY (game_id)",
		"DROP INDEX idx_backlog_user_game_game_id ON backlog_user_game",
		"ALTER TABLE backlog_user_game DROP COLUMN user_id",
	];
	for (const statement of statements)
		// eslint-disable-next-line no-await-in-loop -- chaque instruction dépend des précédentes
		await sequelize.query(statement);
}

// Après le test, quoi qu'il arrive : les tables retrouvent l'état de V022, sans quoi les tests du Backlog échoueraient
// tous et masqueraient la vraie panne. Sans effet si la migration rejouée a réussi
async function restoreTablesAfterMigration(): Promise<void> {
	if ((await selectTablesWithUserId()).length === OWNED_TABLES.length) return;
	await replayMigration(MIGRATION_FILE);
}

describe("addBacklogUserId", () => {
	describe("existing rows", () => {
		it("SHOULD delete the backlog and the hand-made series, and keep the IGDB data WHEN the backlog has no owner yet", async () => {
			// Arrange
			await restoreTablesBeforeMigration();
			onTestFinished(restoreTablesAfterMigration);
			const [igdbSeriesId] = await sequelize.query(
				"INSERT INTO backlog_series (name, igdb_collection_id) VALUES ('The Elder Scrolls', :collectionId)",
				{
					type: QueryTypes.INSERT,
					replacements: { collectionId: await nextIgdbId() },
				},
			);
			const [handMadeSeriesId] = await sequelize.query(
				"INSERT INTO backlog_series (name) VALUES ('Mes jeux')",
				{ type: QueryTypes.INSERT },
			);
			const stored = await seedStoredGame({ proposedSeriesId: igdbSeriesId });
			await sequelize.query(
				`INSERT INTO backlog_user_game (game_id, ending_type, series_id, series_number)
				VALUES (:gameId, 'story', :seriesId, 1)`,
				{
					replacements: { gameId: stored.gameId, seriesId: handMadeSeriesId },
				},
			);
			await sequelize.query(
				"INSERT INTO backlog_user_version (version_id, platform_id) VALUES (:gameId, :platformId)",
				{
					replacements: {
						gameId: stored.gameId,
						platformId: SEEDED_PLATFORMS.PS3,
					},
				},
			);

			// Act
			await replayMigration(MIGRATION_FILE);

			// Assert
			expect(await countTableRows("backlog_user_game")).toBe(0);
			expect(await countTableRows("backlog_user_version")).toBe(0);
			expect(await selectBacklogRows.series(handMadeSeriesId)).toBeNull();
			expect(await selectBacklogRows.series(igdbSeriesId)).not.toBeNull();
			expect(
				(await selectBacklogRows.gameIds(stored.gameId)).versionIds,
			).toStrictEqual([stored.gameId]);
			expect(await selectTablesWithUserId()).toStrictEqual(
				[...OWNED_TABLES].toSorted(),
			);
		});
	});

	describe("owner", () => {
		it("SHOULD accept the same game, version and platform in two backlogs", async () => {
			// Arrange
			const firstUserId = await insertAuthRows.user();
			const secondUserId = await insertAuthRows.user();
			const stored = await seedStoredGame();

			// Act
			for (const userId of [firstUserId, secondUserId]) {
				// eslint-disable-next-line no-await-in-loop -- un backlog après l'autre
				await insertBacklogRows.userGame({ userId, gameId: stored.gameId });
				// eslint-disable-next-line no-await-in-loop -- un backlog après l'autre
				await insertBacklogRows.userVersion({
					userId,
					versionId: stored.gameId,
					platformId: SEEDED_PLATFORMS.PS3,
				});
			}

			// Assert
			expect(
				await selectBacklogRows.userVersions(firstUserId, stored.gameId),
			).toHaveLength(1);
			expect(
				await selectBacklogRows.userVersions(secondUserId, stored.gameId),
			).toHaveLength(1);
		});

		it("SHOULD refuse a second played version on the same version and platform WHEN it is the same account", async () => {
			// Arrange
			const userId = await insertAuthRows.user();
			const stored = await seedStoredGame();
			await insertBacklogRows.userVersion({
				userId,
				versionId: stored.gameId,
				platformId: SEEDED_PLATFORMS.PS3,
			});

			// Act
			const insertion = insertBacklogRows.userVersion({
				userId,
				versionId: stored.gameId,
				platformId: SEEDED_PLATFORMS.PS3,
			});

			// Assert
			await expect(insertion).rejects.toThrow(UniqueConstraintError);
		});

		it("SHOULD refuse a hand-made series without account, and an IGDB series with one", async () => {
			// Arrange
			const userId = await insertAuthRows.user();

			// Act
			const handMadeWithoutOwner = insertBacklogRows.series({
				name: "Orpheline",
			});
			const igdbWithOwner = insertBacklogRows.series({
				userId,
				name: "Zelda",
				igdbFranchiseId: await nextIgdbId(),
			});

			// Assert
			await expect(handMadeWithoutOwner).rejects.toThrow(DatabaseError);
			await expect(igdbWithOwner).rejects.toThrow(DatabaseError);
		});
	});
});

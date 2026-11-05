import { ForeignKeyConstraintError, QueryTypes } from "sequelize";
import { describe, expect, it, onTestFinished } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { insertAuthRows } from "../../testUtils/integration/auth/insertAuthRows.ts";
import { countTableRows } from "../../testUtils/integration/countTableRows.ts";
import { insertBossRow } from "../../testUtils/integration/gameDeathCounter/insertBossRow.ts";
import { insertDeathRow } from "../../testUtils/integration/gameDeathCounter/insertDeathRow.ts";
import { insertGameRow } from "../../testUtils/integration/gameDeathCounter/insertGameRow.ts";
import { selectBossRow } from "../../testUtils/integration/gameDeathCounter/selectBossRow.ts";
import { selectDeathRow } from "../../testUtils/integration/gameDeathCounter/selectDeathRow.ts";
import { selectGameRow } from "../../testUtils/integration/gameDeathCounter/selectGameRow.ts";
import { NON_EXISTENT_ID } from "../../testUtils/integration/nonExistentId.ts";
import { replayMigration } from "../../testUtils/integration/replayMigration.ts";

// La migration V021
const MIGRATION_FILE = "V021__add_gdc_game_user_id.sql";

type ColumnRow = { columnName: string };

async function selectGameColumnNames(): Promise<string[]> {
	const rows = await sequelize.query<ColumnRow>(
		`SELECT COLUMN_NAME AS columnName FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'gdc_game'`,
		{ type: QueryTypes.SELECT },
	);
	return rows.map((row) => row.columnName);
}

// La table telle que V020 l'a laissée : sans propriétaire
async function restoreTableBeforeMigration(): Promise<void> {
	await sequelize.query(
		"ALTER TABLE gdc_game DROP FOREIGN KEY fk_gdc_game_user",
	);
	await sequelize.query("DROP INDEX idx_gdc_game_user_id_name ON gdc_game");
	await sequelize.query("ALTER TABLE gdc_game DROP COLUMN user_id");
}

// Après le test, quoi qu'il arrive : la table retrouve l'état de V021, sans quoi les tests du Game Death Counter
// échoueraient tous et masqueraient la vraie panne. Sans effet si la migration rejouée a réussi
async function restoreTableAfterMigration(): Promise<void> {
	if ((await selectGameColumnNames()).includes("user_id")) return;
	await sequelize.query("DELETE FROM gdc_game");
	await replayMigration(MIGRATION_FILE);
}

describe("addGdcGameUserId", () => {
	describe("existing rows", () => {
		it("SHOULD delete every game with its bosses and deaths WHEN the games have no owner yet", async () => {
			// Arrange : les jeux des autres tests partent aussi, comme en prod
			await restoreTableBeforeMigration();
			onTestFinished(restoreTableAfterMigration);
			const [gameId] = await sequelize.query(
				"INSERT INTO gdc_game (name) VALUES ('Hollow Knight')",
				{ type: QueryTypes.INSERT },
			);
			const bossId = await insertBossRow({ gameId, name: "Hornet" });
			const deathId = await insertDeathRow({
				bossId,
				date: new Date("2017-02-24T20:00:00.000Z"),
			});

			// Act
			await replayMigration(MIGRATION_FILE);

			// Assert
			expect(await countTableRows("gdc_game")).toBe(0);
			expect(await selectBossRow(bossId)).toBeNull();
			expect(await selectDeathRow(deathId)).toBeNull();
			expect(await selectGameColumnNames()).toContain("user_id");
		});
	});

	describe("owner", () => {
		it("SHOULD refuse a game WHEN its account does not exist", async () => {
			// Act
			const insertion = insertGameRow({
				userId: NON_EXISTENT_ID,
				name: "Celeste",
			});

			// Assert
			await expect(insertion).rejects.toThrow(ForeignKeyConstraintError);
		});

		it("SHOULD delete only the games, bosses and deaths of the account WHEN the account is deleted", async () => {
			// Arrange
			const deletedUserId = await insertAuthRows.user();
			const otherUserId = await insertAuthRows.user();
			const gameId = await insertGameRow({
				userId: deletedUserId,
				name: "Elden Ring",
			});
			const bossId = await insertBossRow({ gameId, name: "Malenia" });
			const deathId = await insertDeathRow({
				bossId,
				date: new Date("2022-03-01T20:00:00.000Z"),
			});
			const otherGameId = await insertGameRow({
				userId: otherUserId,
				name: "Elden Ring",
			});

			// Act
			await sequelize.query("DELETE FROM auth_user WHERE id = :id", {
				replacements: { id: deletedUserId },
			});

			// Assert
			expect(await selectGameRow(gameId)).toBeNull();
			expect(await selectBossRow(bossId)).toBeNull();
			expect(await selectDeathRow(deathId)).toBeNull();
			expect(await selectGameRow(otherGameId)).not.toBeNull();
		});
	});
});

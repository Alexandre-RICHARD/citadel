import { SubPlatformTypeEnum } from "@citadel/specs/src/projects/backlog/enum/subPlatformType.enum.ts";
import { QueryTypes } from "sequelize";
import { describe, expect, it, onTestFinished } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { insertBacklogRows } from "../../testUtils/integration/backlog/insertBacklogRows.ts";
import { SEEDED_PLATFORMS } from "../../testUtils/integration/backlog/seededPlatforms.ts";
import { replayMigration } from "../../testUtils/integration/replayMigration.ts";

// La migration V024
const MIGRATION_FILE = "V024__add_platform_sub_platform_type.sql";

type ColumnRow = { columnName: string };
type PlatformRow = { id: number; subPlatformType: string | null };

async function selectPlatformColumnNames(): Promise<string[]> {
	const rows = await sequelize.query<ColumnRow>(
		`SELECT COLUMN_NAME AS columnName FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'backlog_platform'`,
		{ type: QueryTypes.SELECT },
	);
	return rows.map((row) => row.columnName);
}

async function selectSubPlatformType(id: number): Promise<string | null> {
	const row = await sequelize.query<PlatformRow>(
		"SELECT id, sub_platform_type AS subPlatformType FROM backlog_platform WHERE id = :id",
		{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
	);
	return row?.subPlatformType ?? null;
}

// La table telle que V023 l'a laissée : un parent (emulated_platform_id), sans type d'enfant
async function restoreTableBeforeMigration(): Promise<void> {
	await sequelize.query(
		"ALTER TABLE backlog_platform DROP CONSTRAINT ck_backlog_platform_sub_platform_type",
	);
	await sequelize.query(
		"ALTER TABLE backlog_platform DROP FOREIGN KEY fk_backlog_platform_parent_platform",
	);
	await sequelize.query(
		"ALTER TABLE backlog_platform DROP COLUMN sub_platform_type",
	);
	await sequelize.query(
		"ALTER TABLE backlog_platform CHANGE COLUMN parent_platform_id emulated_platform_id INT NULL",
	);
	await sequelize.query(
		`ALTER TABLE backlog_platform ADD CONSTRAINT fk_backlog_platform_emulated_platform
		FOREIGN KEY (emulated_platform_id) REFERENCES backlog_platform (id)`,
	);
}

// Après le test, quoi qu'il arrive : la table retrouve l'état de V024, sans quoi tous les tests du Backlog
// échoueraient et masqueraient la vraie panne. Sans effet si la migration rejouée a réussi
async function restoreTableAfterMigration(): Promise<void> {
	if ((await selectPlatformColumnNames()).includes("sub_platform_type")) return;
	await replayMigration(MIGRATION_FILE);
}

describe("addPlatformSubPlatformType", () => {
	describe("existing rows", () => {
		it("SHOULD type the emulators, the launchers of the PC, and leave the platforms without parent untyped", async () => {
			// Arrange
			await restoreTableBeforeMigration();
			onTestFinished(restoreTableAfterMigration);

			// Act
			await replayMigration(MIGRATION_FILE);

			// Assert
			expect(await selectSubPlatformType(SEEDED_PLATFORMS.PCSX2)).toBe(
				SubPlatformTypeEnum.EMULATOR,
			);
			expect(await selectSubPlatformType(SEEDED_PLATFORMS.RPCS3)).toBe(
				SubPlatformTypeEnum.EMULATOR,
			);
			expect(await selectSubPlatformType(SEEDED_PLATFORMS.STEAM)).toBe(
				SubPlatformTypeEnum.LAUNCHER,
			);
			expect(await selectSubPlatformType(SEEDED_PLATFORMS.PC)).toBeNull();
			expect(await selectSubPlatformType(SEEDED_PLATFORMS.PS3)).toBeNull();
			expect(await selectPlatformColumnNames()).not.toContain(
				"emulated_platform_id",
			);
		});
	});

	describe("sub-platform type", () => {
		it("SHOULD refuse a platform WHEN it has a parent but no type", async () => {
			// Act
			const insertion = sequelize.query(
				`INSERT INTO backlog_platform (id, short_name, technical_name, parent_platform_id)
				VALUES (-900, 'Orphan type', 'orphan-type', ${SEEDED_PLATFORMS.PS3})`,
			);

			// Assert
			await expect(insertion).rejects.toThrow(
				/ck_backlog_platform_sub_platform_type/,
			);
		});

		it("SHOULD refuse a platform WHEN it has a type but no parent", async () => {
			// Act
			const insertion = sequelize.query(
				`INSERT INTO backlog_platform (id, short_name, technical_name, sub_platform_type)
				VALUES (-901, 'Orphan parent', 'orphan-parent', 'launcher')`,
			);

			// Assert
			await expect(insertion).rejects.toThrow(
				/ck_backlog_platform_sub_platform_type/,
			);
		});

		it("SHOULD accept a launcher of the PC", async () => {
			// Act
			await insertBacklogRows.platform({
				id: -902,
				shortName: "Test launcher",
				parentPlatformId: SEEDED_PLATFORMS.PC,
				subPlatformType: SubPlatformTypeEnum.LAUNCHER,
			});
			onTestFinished(async () => {
				await sequelize.query("DELETE FROM backlog_platform WHERE id = -902");
			});

			// Assert
			expect(await selectSubPlatformType(-902)).toBe(
				SubPlatformTypeEnum.LAUNCHER,
			);
		});
	});
});

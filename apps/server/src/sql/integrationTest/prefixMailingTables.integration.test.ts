import { QueryTypes } from "sequelize";
import { describe, expect, it } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { buildUniqueWord } from "../../testUtils/integration/buildUniqueWord.ts";
import { replayMigration } from "../../testUtils/integration/replayMigration.ts";

// La migration V013
const MIGRATION_FILE = "V013__prefix_mailing_tables.sql";

type FailureRow = { kind: string; reason: string };
type UnsentRow = { subject: string; message: string };
type IndexRow = { indexName: string };

// La base telle que V012 l'a laissée : anciens noms des tables et de l'index
async function restoreTablesBeforeMigration(): Promise<void> {
	await sequelize.query(
		`RENAME TABLE
			mailing_failure TO mail_failure,
			mailing_contact_message_unsent TO contact_message_unsent`,
	);
	await sequelize.query(
		"ALTER TABLE mail_failure RENAME INDEX idx_mailing_failure_created_at TO idx_mail_failure_created_at",
	);
}

async function selectFailure(reason: string): Promise<FailureRow[]> {
	return sequelize.query<FailureRow>(
		"SELECT kind, reason FROM mailing_failure WHERE reason = :reason",
		{ type: QueryTypes.SELECT, replacements: { reason } },
	);
}

async function selectUnsent(subject: string): Promise<UnsentRow[]> {
	return sequelize.query<UnsentRow>(
		"SELECT subject, message FROM mailing_contact_message_unsent WHERE subject = :subject",
		{ type: QueryTypes.SELECT, replacements: { subject } },
	);
}

async function selectFailureIndexNames(): Promise<string[]> {
	const rows = await sequelize.query<IndexRow>(
		`SELECT DISTINCT INDEX_NAME AS indexName
		FROM information_schema.STATISTICS
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mailing_failure'
		ORDER BY INDEX_NAME`,
		{ type: QueryTypes.SELECT },
	);
	return rows.map((row) => row.indexName);
}

describe("prefixMailingTables", () => {
	describe("existing rows", () => {
		it("SHOULD keep every row and rename the index WHEN the mail tables are renamed", async () => {
			// Arrange
			const reason = buildUniqueWord();
			const subject = buildUniqueWord();
			await restoreTablesBeforeMigration();
			await sequelize.query(
				"INSERT INTO mail_failure (kind, reason) VALUES ('contact-notification', :reason)",
				{ replacements: { reason } },
			);
			await sequelize.query(
				"INSERT INTO contact_message_unsent (subject, message) VALUES (:subject, 'Bonjour')",
				{ replacements: { subject } },
			);

			// Act
			await replayMigration(MIGRATION_FILE);

			// Assert
			expect(await selectFailure(reason)).toStrictEqual([
				{ kind: "contact-notification", reason },
			]);
			expect(await selectUnsent(subject)).toStrictEqual([
				{ subject, message: "Bonjour" },
			]);
			expect(await selectFailureIndexNames()).toStrictEqual([
				"idx_mailing_failure_created_at",
				"PRIMARY",
			]);
		});
	});
});

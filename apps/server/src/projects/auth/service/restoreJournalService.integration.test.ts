import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it, onTestFinished } from "vitest";

import { authSettings } from "../../../configuration/authSettings.ts";
import { sequelize } from "../../../configuration/sequelize.ts";
import { insertTestAccount } from "../../../testUtils/integration/auth/insertTestAccount.ts";
import { readRestoreJournal } from "../../../testUtils/integration/auth/readRestoreJournal.ts";
import { RestoreJournalActionEnum } from "../enum/restoreJournalAction.enum.ts";
import { buildRestoreJournalFileName } from "../helper/restoreJournal/buildRestoreJournalFileName.ts";
import { restoreJournalService } from "./restoreJournalService.ts";

const DIRECTORY = authSettings.restoreJournalDirectory;

async function writeJournalFile(fileName: string, content = ""): Promise<void> {
	await mkdir(DIRECTORY, { recursive: true });
	await writeFile(path.join(DIRECTORY, fileName), content);
}

describe("restoreJournalService", () => {
	describe("write", () => {
		it("SHOULD append one dated JSON line, with the username, in the file of the day", async () => {
			// Arrange
			const { userId, username } = await insertTestAccount();
			const before = Date.now();

			// Act
			await sequelize.transaction(async (transaction) =>
				restoreJournalService.write(
					{
						userId,
						action: RestoreJournalActionEnum.EMAIL_CHANGED,
						email: "nouvelle@example.com",
					},
					transaction,
				),
			);

			// Assert
			const [line] = await readRestoreJournal(userId);
			expect(line).toStrictEqual({
				at: expect.any(Date) as Date,
				userId,
				username,
				action: RestoreJournalActionEnum.EMAIL_CHANGED,
				email: "nouvelle@example.com",
			});
			expect(line?.at.getTime()).toBeGreaterThanOrEqual(before);
			expect(await readdir(DIRECTORY)).toContain(
				buildRestoreJournalFileName(new Date()),
			);
		});

		it("SHOULD throw, writing nothing, WHEN the account does not exist", async () => {
			// Act
			const writing = sequelize.transaction(async (transaction) =>
				restoreJournalService.write(
					{
						userId: 2_000_000_000,
						action: RestoreJournalActionEnum.SECURITY_CHANGED,
					},
					transaction,
				),
			);

			// Assert
			await expect(writing).rejects.toThrow(
				"Restore journal line for a missing account",
			);
			expect(await readRestoreJournal(2_000_000_000)).toStrictEqual([]);
		});
	});

	describe("readAll", () => {
		it("SHOULD read every line back and count the unreadable ones apart", async () => {
			// Arrange
			const { userId, username } = await insertTestAccount();
			// Un jour à lui, effacé ensuite : les autres tests lisent le même dossier
			const fileName = "2999-01-01.jsonl";
			onTestFinished(async () => rm(path.join(DIRECTORY, fileName)));
			await writeJournalFile(
				fileName,
				`${JSON.stringify({ at: "2999-01-01T10:00:00.000Z", userId, username, action: RestoreJournalActionEnum.SECURITY_CHANGED })}
{"at":"2999-01-01T10:01
`,
			);

			// Act
			const { lines, unreadableCount } = await restoreJournalService.readAll();

			// Assert
			expect(lines.filter((line) => line.userId === userId)).toStrictEqual([
				{
					at: new Date("2999-01-01T10:00:00.000Z"),
					userId,
					username,
					action: RestoreJournalActionEnum.SECURITY_CHANGED,
				},
			]);
			expect(unreadableCount).toBeGreaterThanOrEqual(1);
		});
	});

	describe("purge", () => {
		it("SHOULD delete the days older than 70 days and keep the recent ones", async () => {
			// Arrange
			const now = new Date("2026-11-05T10:00:00.000Z");
			await writeJournalFile("2001-08-26.jsonl");
			await writeJournalFile("2026-08-28.jsonl");

			// Act
			await restoreJournalService.purge(now);

			// Assert
			const fileNames = await readdir(DIRECTORY);
			expect(fileNames).not.toContain("2001-08-26.jsonl");
			expect(fileNames).toContain("2026-08-28.jsonl");
		});

		it("SHOULD never delete a file that is not part of the journal", async () => {
			// Arrange
			await writeJournalFile("2001-08-26.jsonl.notes");

			// Act
			await restoreJournalService.purge(new Date());

			// Assert
			expect(await readdir(DIRECTORY)).toContain("2001-08-26.jsonl.notes");
		});
	});
});

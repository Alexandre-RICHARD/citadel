import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it, onTestFinished } from "vitest";

import { authSettings } from "../../../configuration/authSettings.ts";
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
	describe("record", () => {
		it("SHOULD append one dated JSON line in the file of the day", async () => {
			// Arrange
			const { userId } = await insertTestAccount();
			const before = Date.now();

			// Act
			await restoreJournalService.record({
				userId,
				action: RestoreJournalActionEnum.EMAIL_CHANGED,
				email: "nouvelle@example.com",
			});

			// Assert
			const [line] = await readRestoreJournal(userId);
			expect(line).toStrictEqual({
				at: expect.any(String) as string,
				userId,
				action: RestoreJournalActionEnum.EMAIL_CHANGED,
				email: "nouvelle@example.com",
			});
			expect(Date.parse(line?.at ?? "")).toBeGreaterThanOrEqual(before);
			expect(await readdir(DIRECTORY)).toContain(
				buildRestoreJournalFileName(new Date()),
			);
		});
	});

	describe("readAll", () => {
		it("SHOULD read every line back and count the unreadable ones apart", async () => {
			// Arrange
			const { userId } = await insertTestAccount();
			// Un jour à lui, effacé ensuite : les autres tests lisent le même dossier
			const fileName = "2999-01-01.jsonl";
			onTestFinished(async () => rm(path.join(DIRECTORY, fileName)));
			await writeJournalFile(
				fileName,
				`${JSON.stringify({ at: "2999-01-01T10:00:00.000Z", userId, action: RestoreJournalActionEnum.SECURITY_CHANGED })}
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

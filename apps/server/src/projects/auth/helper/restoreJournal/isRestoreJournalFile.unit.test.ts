import { describe, expect, it } from "vitest";

import { isRestoreJournalFile } from "./isRestoreJournalFile.ts";

describe("isRestoreJournalFile.ts", () => {
	describe("journal", () => {
		it("SHOULD recognize the file of a day", () => {
			expect(isRestoreJournalFile("2026-11-05.jsonl")).toBe(true);
		});

		it.each([
			"notes.txt",
			"2026-11-05.jsonl.tmp",
			"2026-11-05.json",
			"26-11-05.jsonl",
		])("SHOULD not take %s for a file of the journal", (fileName) => {
			expect(isRestoreJournalFile(fileName)).toBe(false);
		});
	});
});

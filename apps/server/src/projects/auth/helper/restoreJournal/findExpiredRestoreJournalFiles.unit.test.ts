import { describe, expect, it } from "vitest";

import { findExpiredRestoreJournalFiles } from "./findExpiredRestoreJournalFiles.ts";

const CUTOFF = new Date("2026-08-28T10:00:00.000Z");

describe("findExpiredRestoreJournalFiles.ts", () => {
	describe("expired", () => {
		it("SHOULD designate the days that ended before the cutoff", () => {
			expect(
				findExpiredRestoreJournalFiles(
					["2026-08-26.jsonl", "2026-08-27.jsonl"],
					CUTOFF,
				),
			).toStrictEqual(["2026-08-26.jsonl", "2026-08-27.jsonl"]);
		});
	});

	describe("kept", () => {
		it("SHOULD keep the day of the cutoff WHEN some of its lines are still recent", () => {
			expect(
				findExpiredRestoreJournalFiles(
					["2026-08-28.jsonl", "2026-08-29.jsonl"],
					CUTOFF,
				),
			).toStrictEqual([]);
		});

		it("SHOULD never designate a file that is not part of the journal", () => {
			expect(
				findExpiredRestoreJournalFiles(
					["notes.txt", "2026-08-01.jsonl.tmp", "2026-08-01.json"],
					CUTOFF,
				),
			).toStrictEqual([]);
		});
	});
});

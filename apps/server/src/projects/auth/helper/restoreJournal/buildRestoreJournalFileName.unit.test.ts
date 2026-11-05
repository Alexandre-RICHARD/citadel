import { describe, expect, it } from "vitest";

import { buildRestoreJournalFileName } from "./buildRestoreJournalFileName.ts";

describe("buildRestoreJournalFileName.ts", () => {
	describe("name", () => {
		it("SHOULD name the file after the UTC day of the action", () => {
			expect(
				buildRestoreJournalFileName(new Date("2026-11-05T23:30:00.000Z")),
			).toBe("2026-11-05.jsonl");
		});

		it("SHOULD follow the UTC day WHEN the local day is already the next one", () => {
			expect(
				buildRestoreJournalFileName(new Date("2026-11-05T23:30:00.000-02:00")),
			).toBe("2026-11-06.jsonl");
		});
	});
});

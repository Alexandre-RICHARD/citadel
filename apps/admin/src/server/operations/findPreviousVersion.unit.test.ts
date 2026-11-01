import { describe, expect, it } from "vitest";

import { findPreviousVersion } from "./findPreviousVersion.ts";

const HISTORY = [
	"2026-10-25 15:02:11  v2026.10.25  ok  (depuis aucune)",
	"2026-10-26 09:40:00  v2026.10.26  ok  (depuis v2026.10.25)",
	"2026-10-27 10:00:00  v2026.10.27  échec  (retour automatique à v2026.10.26)",
	"2026-10-28 11:00:00  v2026.10.28  ok  (depuis v2026.10.26)",
	"2026-10-28 12:00:00  v2026.10.28  restore-db  (/Volume2/backups/db/daily/x.sql.zst)",
	"",
].join("\n");

describe("findPreviousVersion.ts", () => {
	describe("history", () => {
		it("SHOULD give the last successful version before the current one WHEN reading the log", () => {
			expect(findPreviousVersion(HISTORY, "v2026.10.28")).toBe("v2026.10.26");
		});

		it("SHOULD ignore failed deployments WHEN they come after a success", () => {
			expect(findPreviousVersion(HISTORY, "v2026.10.26")).toBe("v2026.10.28");
		});

		it("SHOULD return null WHEN only the current version was ever deployed", () => {
			expect(
				findPreviousVersion(
					"2026-10-25 15:02:11  v2026.10.25  ok  (depuis aucune)\n",
					"v2026.10.25",
				),
			).toBeNull();
		});

		it("SHOULD return null WHEN the log is empty", () => {
			expect(findPreviousVersion("", null)).toBeNull();
		});
	});
});

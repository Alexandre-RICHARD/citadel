import { describe, expect, it } from "vitest";

import { parseDeployHistory } from "./parseDeployHistory.ts";

const HISTORY = [
	"2026-10-25 15:02:11  v2026.10.25  ok  (depuis aucune)",
	"2026-10-26 09:40:00  v2026.10.26  ok  (depuis v2026.10.25)",
	"2026-10-27 10:00:00  v2026.10.27  échec  (retour automatique à v2026.10.26)",
	"",
].join("\n");

describe("parseDeployHistory.ts", () => {
	describe("lines", () => {
		it("SHOULD list the most recent first, with date and text WHEN reading the log", () => {
			expect(parseDeployHistory(HISTORY, 10)[0]).toEqual({
				date: "2026-10-27 10:00:00",
				text: "v2026.10.27 · échec · (retour automatique à v2026.10.26)",
			});
		});

		it("SHOULD keep only the latest lines WHEN the log is longer than the limit", () => {
			expect(parseDeployHistory(HISTORY, 2).map((entry) => entry.date)).toEqual(
				["2026-10-27 10:00:00", "2026-10-26 09:40:00"],
			);
		});
	});
});

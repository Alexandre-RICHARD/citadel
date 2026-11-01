import { describe, expect, it } from "vitest";

import { parseBackupDate } from "./parseBackupDate";

describe("parseBackupDate.ts", () => {
	describe("names", () => {
		it("SHOULD read the date and time WHEN the name follows the backup pattern", () => {
			expect(
				parseBackupDate("citadel-20261101-050012-v2026.10.27.sql.zst"),
			).toEqual(new Date(2026, 10, 1, 5, 0, 12));
		});

		it("SHOULD return null WHEN the name does not follow the pattern", () => {
			expect(parseBackupDate("dump.sql.zst")).toBeNull();
		});
	});
});

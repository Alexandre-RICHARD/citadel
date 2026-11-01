import { describe, expect, it } from "vitest";

import type { BackupItem } from "../../shared/backupItem.type";
import { formatBackupLabel } from "./formatBackupLabel";

function backup(name: string, kind: BackupItem["kind"]): BackupItem {
	return {
		location: "nas",
		path: `${kind}/${name}`,
		kind,
		name,
		sizeBytes: 1_234_000,
	};
}

describe("formatBackupLabel.ts", () => {
	describe("label", () => {
		it("SHOULD give the date, the kind and the size WHEN the name holds a date", () => {
			expect(
				formatBackupLabel(
					backup("citadel-20261101-050000-v2026.11.01.01.sql.zst", "daily"),
				),
			).toBe("dim. 1 nov., 05:00 · de la nuit · 1,23 Mo");
		});

		it("SHOULD fall back to the file name WHEN the name holds no date", () => {
			expect(formatBackupLabel(backup("dump.sql.zst", "pre-deploy"))).toBe(
				"dump.sql.zst · avant déploiement · 1,23 Mo",
			);
		});
	});
});
